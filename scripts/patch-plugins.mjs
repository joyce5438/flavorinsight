import fs from "node:fs";
import path from "node:path";

const targetFile = path.resolve("node_modules/@enhancely/emdash/src/sandbox-entry.ts");
if (fs.existsSync(targetFile)) {
	let content = fs.readFileSync(targetFile, "utf-8");
	if (content.includes("export default definePlugin({") && !content.includes('id: "enhancely"')) {
		content = content.replace(
			"export default definePlugin({",
			'export default definePlugin({\n\tid: "enhancely",\n\tversion: "0.1.0",',
		);
		console.log("[patch-plugins] Patched @enhancely/emdash with id and version");
	}
	if (content.includes("routeCtx: { input: unknown; request: { url: string } },")) {
		content = content.replace(
			"routeCtx: { input: unknown; request: { url: string } },\n\t\t\t\tctx: PluginContext,",
			"routeCtx: any,\n\t\t\t\tctxArg?: any,",
		);
		content = content.replace(
			"const interaction = routeCtx.input as {",
			"const ctx = ctxArg || routeCtx;\n\t\t\t\tconst input = routeCtx?.input ?? routeCtx ?? {};\n\t\t\t\tconst interaction = input as {",
		);
		content = content.replace(
			"_routeCtx: { input: unknown; request: unknown }, ctx: PluginContext",
			"routeCtx: any, ctxArg?: any",
		);
		content = content.replace(
			"const apiKey = await ctx.kv.get<string>(\"settings:apiKey\");",
			"const ctx = ctxArg || routeCtx;\n\t\t\t\tconst apiKey = await ctx.kv.get<string>(\"settings:apiKey\");",
		);
		console.log("[patch-plugins] Patched @enhancely/emdash route handler context");
	}
	fs.writeFileSync(targetFile, content, "utf-8");
}
