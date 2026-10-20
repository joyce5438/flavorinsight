import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

import { seoPlugin } from "@jdevalk/emdash-plugin-seo";
import { notFoundViewerPlugin } from "@devondragon/emdash-plugin-404-viewer";
import { tocgenPlugin } from "@plugdash/tocgen";
import { calloutPlugin } from "@plugdash/callout";
import { readtimePlugin } from "@plugdash/readtime";
import { authorBoxPlugin } from "emdash-author-box";
import { sharepostPlugin } from "@plugdash/sharepost";
import { featuredImageStudioPlugin } from "@devondragon/emdash-plugin-featured-image-studio";
import { pageListPlugin } from "emdash-page-list";
import { contentInsightsPlugin } from "@yourbright/emdash-analytics-plugin";
import { enhancelyPlugin } from "@enhancely/emdash";
import { shortlinkPlugin } from "@plugdash/shortlink";
import { colorPlugin } from "@emdash-cms/plugin-color";

export default defineConfig({
	site: "https://flavorinsight.com",
	output: "server",
	adapter: cloudflare(),
	i18n: {
		defaultLocale: "zh-TW",
		locales: ["zh-TW"],
		routing: {
			prefixDefaultLocale: false,
		},
	},
	redirects: {
		"/smoothtripml1": "/posts/penang-walking-notes",
		"/posts/smoothtripml1": "/posts/penang-walking-notes",
		"/s/qa39gaek": "/posts/penang-walking-notes",
		"/penang-walking-notes": "/posts/penang-walking-notes",
		"/smoothtripml2": "/posts/malaysia-ktm-train-guide",
		"/posts/smoothtripml2": "/posts/malaysia-ktm-train-guide",
		"/s/1rrydm6y": "/posts/malaysia-ktm-train-guide",
		"/malaysia-ktm-train-guide": "/posts/malaysia-ktm-train-guide",
		"/smoothtripml3": "/posts/malaysia-street-hospitality",
		"/posts/smoothtripml3": "/posts/malaysia-street-hospitality",
		"/s/htethb09": "/posts/malaysia-street-hospitality",
		"/malaysia-street-hospitality": "/posts/malaysia-street-hospitality",
		"/livingwisdom": "/posts/malaysia-multiracial-code",
		"/posts/livingwisdom": "/posts/malaysia-multiracial-code",
		"/s/nx8bjshf": "/posts/malaysia-multiracial-code",
		"/malaysia-multiracial-code": "/posts/malaysia-multiracial-code",
		"/penangtotainan": "/posts/penang-tainan-wok-hei",
		"/posts/penangtotainan": "/posts/penang-tainan-wok-hei",
		"/s/htrn8h38": "/posts/penang-tainan-wok-hei",
		"/penang-tainan-wok-hei": "/posts/penang-tainan-wok-hei",
		"/malaysianfood1": "/posts/klang-bak-kut-teh-origins",
		"/posts/malaysianfood1": "/posts/klang-bak-kut-teh-origins",
		"/s/sh6dxdmk": "/posts/klang-bak-kut-teh-origins",
		"/klang-bak-kut-teh-origins": "/posts/klang-bak-kut-teh-origins",
		"/malaysianfood2": "/posts/penang-hawker-ban-street-food",
		"/posts/malaysianfood2": "/posts/penang-hawker-ban-street-food",
		"/s/01n1hk3v": "/posts/penang-hawker-ban-street-food",
		"/penang-hawker-ban-street-food": "/posts/penang-hawker-ban-street-food",
		"/malaysianfood3": "/posts/ramly-burger-hainan-roots",
		"/posts/malaysianfood3": "/posts/ramly-burger-hainan-roots",
		"/s/68asw9zv": "/posts/ramly-burger-hainan-roots",
		"/ramly-burger-hainan-roots": "/posts/ramly-burger-hainan-roots",
		"/tobecontinued": "/posts/malaysia-deep-travel-guide",
		"/posts/tobecontinued": "/posts/malaysia-deep-travel-guide",
		"/s/z0r9sn7d": "/posts/malaysia-deep-travel-guide",
		"/malaysia-deep-travel-guide": "/posts/malaysia-deep-travel-guide",
	},
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: d1({ binding: "DB", session: "auto", coalesce: true }),
			storage: r2({ binding: "MEDIA" }),
			plugins: [
				seoPlugin(),
				notFoundViewerPlugin(),
				tocgenPlugin(),
				calloutPlugin(),
				readtimePlugin(),
				authorBoxPlugin(),
				sharepostPlugin(),
				shortlinkPlugin({ prefix: "/s/" }),
				colorPlugin(),
				featuredImageStudioPlugin(),
				pageListPlugin(),
				contentInsightsPlugin(),
				enhancelyPlugin(),
			],
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Inter",
			cssVariable: "--font-body",
			weights: [400, 500, 600, 700],
			fallbacks: ["sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "JetBrains Mono",
			cssVariable: "--font-mono",
			weights: [400, 500],
			fallbacks: ["monospace"],
		},
		{
			provider: fontProviders.google(),
			name: "Lora",
			cssVariable: "--font-heading",
			weights: [400, 500, 600, 700],
			fallbacks: ["serif"],
		},
	],
	devToolbar: { enabled: false },
});
