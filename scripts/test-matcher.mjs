import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const GITHUB_DIR = "/tmp/flavorinsight-github/wp-content/uploads";

// 1. Get all files in GITHUB_DIR
const localFiles = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else localFiles.push(full);
  }
}
walk(GITHUB_DIR);

// 2. Query posts from D1
const d1Output = execSync("npx wrangler d1 execute flavorinsight-db --remote --command \"SELECT id, title, slug, content FROM ec_posts WHERE title LIKE '%馬來%';\" --json").toString();
const posts = JSON.parse(d1Output)[0].results;

const postMediaUrls = new Set();
for (const p of posts) {
  const blocks = JSON.parse(p.content);
  for (const b of blocks) {
    if (b.asset?.url) postMediaUrls.add(b.asset.url);
    if (b.url && (b.url.includes("wp-content") || b.url.endsWith(".mp3"))) postMediaUrls.add(b.url);
    if (b.html) {
      const matches = b.html.match(/src=["']([^"']+)["']/g) || [];
      for (const m of matches) postMediaUrls.add(m.slice(5, -1));
    }
  }
}

console.log(`Found ${postMediaUrls.size} media URLs referenced across the 9 posts.`);

function resolveLocalFile(url) {
  let decoded = decodeURIComponent(url);
  let filename = path.basename(decoded);
  
  // Exact match
  let found = localFiles.find(f => path.basename(f) === filename);
  if (found) return found;

  // Strip WP dimension suffix: e.g. -1024x768
  let baseFilename = filename.replace(/-\d+x\d+(?=\.[^.]+$)/, "");
  found = localFiles.find(f => path.basename(f) === baseFilename);
  if (found) return found;

  // Try scaled version if available
  let ext = path.extname(baseFilename);
  let nameNoExt = path.basename(baseFilename, ext);
  let scaledName = `${nameNoExt}-scaled${ext}`;
  found = localFiles.find(f => path.basename(f) === scaledName);
  if (found) return found;

  return null;
}

let matchedCount = 0;
let missing = [];
for (const url of postMediaUrls) {
  if (!url.includes("wp-content") && !url.endsWith(".mp3")) continue;
  const local = resolveLocalFile(url);
  if (local) {
    matchedCount++;
  } else {
    missing.push(url);
  }
}

console.log(`Matched: ${matchedCount}`);
if (missing.length > 0) {
  console.log("Missing:", missing);
} else {
  console.log("SUCCESS! Every single post media URL maps directly to a local file in GitHub repo!");
}
