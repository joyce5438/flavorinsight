import { execSync } from "child_process";
import fs from "fs";

const out = execSync("npx wrangler d1 execute flavorinsight-db --remote --command \"SELECT id, title, slug, content FROM ec_posts WHERE title LIKE '%馬來%';\" --json").toString();
const rows = JSON.parse(out)[0].results;
const mediaUrls = new Set();
for (const r of rows) {
  const blocks = JSON.parse(r.content);
  for (const b of blocks) {
    if (b.asset && b.asset.url) {
      mediaUrls.add(b.asset.url);
    }
    if (b.url && (b.url.includes("wp-content") || b.url.includes(".mp3"))) {
      mediaUrls.add(b.url);
    }
    if (b.html) {
      const matches = b.html.match(/src=["']([^"']+)["']/g) || [];
      for (const m of matches) {
        const src = m.slice(5, -1);
        mediaUrls.add(src);
      }
    }
  }
}
console.log("Total unique media URLs in posts:", mediaUrls.size);
for (const u of Array.from(mediaUrls).sort()) {
  console.log(" ", u);
}
