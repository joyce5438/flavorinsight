import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";

export { PluginBridge };

export default {
	...handler,
	scheduled: createScheduledHandler(),
	async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// 1. Strictly bypass cache for Admin, Auth, internal APIs, and state mutations
		const isAdminOrAuth =
			url.pathname.startsWith("/_emdash/admin") ||
			url.pathname.startsWith("/_emdash/auth");
		const isInternalApi =
			url.pathname.startsWith("/_emdash/api/") &&
			!url.pathname.startsWith("/_emdash/api/media/file/");
		// ONLY cache GET and HEAD requests! POST, PUT, DELETE must bypass cache completely
		if (request.method !== "GET" && request.method !== "HEAD") {
			return handler.fetch(request, env, ctx);
		}

		// Cloudflare Edge Cache API with cache version salt
		const cache = caches.default;
		// Version salt v46: Refine Masthead (remove metabar and topic scroller, update narrative)
		const cacheKeyUrl = new URL(url.toString());
		cacheKeyUrl.searchParams.set("__cfv", "46");
		const cacheKey = new Request(cacheKeyUrl.toString(), {
			method: "GET",
			headers: { "accept": request.headers.get("accept") || "*/*" },
		});

		// Helper to apply baseline security headers
		const applySecurityHeaders = (headers: Headers) => {
			if (!headers.has("X-Content-Type-Options")) {
				headers.set("X-Content-Type-Options", "nosniff");
			}
			if (!headers.has("X-Frame-Options")) {
				headers.set("X-Frame-Options", "SAMEORIGIN");
			}
			if (!headers.has("Referrer-Policy")) {
				headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
			}
		};

		// 2. High-performance Edge & Browser Cache for R2 Media files
		const isMedia = url.pathname.startsWith("/_emdash/api/media/file/");
		if (isMedia) {
			const cachedResponse = await cache.match(cacheKey);
			if (cachedResponse) {
				const cl = cachedResponse.headers.get("content-length");
				if (cl === "0") {
					ctx.waitUntil(cache.delete(cacheKey));
				} else {
					return cachedResponse;
				}
			}

			let response = await handler.fetch(request, env, ctx);
			// Auto-resolve bare media IDs (without file extension) to actual R2 storage keys
			if (response.status === 404 && env.DB) {
				const mediaKey = url.pathname.replace("/_emdash/api/media/file/", "");
				if (mediaKey && !mediaKey.includes("/")) {
					try {
						const row: any = await env.DB.prepare(
							"SELECT storage_key, mime_type FROM media WHERE id = ?"
						).bind(mediaKey).first();
						if (row?.storage_key) {
							if (env.MEDIA) {
								const object = await env.MEDIA.get(row.storage_key);
								if (object) {
									const headers = new Headers();
									object.writeHttpMetadata(headers);
									headers.set("etag", object.httpEtag);
									if (row.mime_type && !headers.has("content-type")) {
										headers.set("content-type", row.mime_type);
									}
									response = new Response(object.body, { headers, status: 200 });
								}
							}
							if (response.status === 404) {
								const fallbackUrl = new URL(url.toString());
								fallbackUrl.pathname = `/_emdash/api/media/file/${row.storage_key}`;
								const fallbackReq = new Request(fallbackUrl.toString(), {
									method: "GET",
									headers: request.headers,
								});
								response = await handler.fetch(fallbackReq, env, ctx);
							}
						}
					} catch (e) {
						// ignore error and proceed
					}
				}
			}

			const cl = response.headers.get("content-length");
			// Only cache valid, non-empty 200 responses
			if (response.status === 200 && cl !== "0") {
				const headers = new Headers(response.headers);
				// Content-addressed R2 media: 7-day browser cache, 30-day edge cache, stale-while-revalidate 1 day
				headers.set(
					"Cache-Control",
					"public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400",
				);
				headers.set("CDN-Cache-Control", "public, max-age=2592000");
				headers.set("X-FI-Cache", "HIT-EDGE-MEDIA");
				applySecurityHeaders(headers);

				const cachedRes = new Response(response.body, {
					status: response.status,
					statusText: response.statusText,
					headers,
				});

				ctx.waitUntil(cache.put(cacheKey, cachedRes.clone()));
				return cachedRes;
			}
			return response;
		}

		// 3. Fast Edge Cache for Public Front-end Pages, Feeds, and Redirects
		// Broad coverage: all non-admin, non-internal-API routes are public frontend
		const isPublicRoute = !isAdminOrAuth && !isInternalApi;

		if (isPublicRoute) {
			const cc = request.headers.get("cache-control") || "";
			const pragma = request.headers.get("pragma") || "";
			const bypassCache =
				cc.includes("no-cache") ||
				cc.includes("max-age=0") ||
				pragma.includes("no-cache");

			if (!bypassCache) {
				const cachedResponse = await cache.match(cacheKey);
				if (cachedResponse) {
					return cachedResponse;
				}
			}

			const response = await handler.fetch(request, env, ctx);
			const contentType = response.headers.get("content-type") || "";
			const hasSetCookie = response.headers.has("set-cookie");

			// Security rule: NEVER cache responses that issue Set-Cookie in public shared cache
			if (hasSetCookie) {
				return response;
			}

			const isCacheableType =
				contentType.includes("text/html") ||
				contentType.includes("xml") ||
				contentType.includes("text/plain") ||
				contentType.includes("application/json");

			// Cache successful public HTML/feed/data responses
			if (response.status === 200 && isCacheableType) {
				const headers = new Headers(response.headers);
				// Public HTML: 60s browser cache, 30-min Edge cache, stale-while-revalidate 1 day
				headers.set(
					"Cache-Control",
					"public, max-age=60, s-maxage=1800, stale-while-revalidate=86400",
				);
				headers.set("CDN-Cache-Control", "public, max-age=1800");
				headers.set("X-FI-Cache", "HIT-EDGE-HTML");
				applySecurityHeaders(headers);

				const cachedRes = new Response(response.body, {
					status: response.status,
					statusText: response.statusText,
					headers,
				});

				ctx.waitUntil(cache.put(cacheKey, cachedRes.clone()));
				return cachedRes;
			}

			// Cache permanent redirects (e.g. legacy redirects, shortlinks) for 24 hours at edge
			if ((response.status === 301 || response.status === 308) && response.headers.has("location")) {
				const headers = new Headers(response.headers);
				headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
				headers.set("CDN-Cache-Control", "public, max-age=86400");
				headers.set("X-FI-Cache", "HIT-EDGE-REDIRECT");
				applySecurityHeaders(headers);

				const cachedRes = new Response(response.body, {
					status: response.status,
					statusText: response.statusText,
					headers,
				});

				ctx.waitUntil(cache.put(cacheKey, cachedRes.clone()));
				return cachedRes;
			}

			return response;
		}

		return handler.fetch(request, env, ctx);
	},
} satisfies ExportedHandler;
