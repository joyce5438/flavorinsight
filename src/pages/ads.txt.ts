import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
	const content = "google.com, pub-3422322348467679, DIRECT, f08c47fec0942fa0\n";
	return new Response(content, {
		status: 200,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=86400",
		},
	});
};
