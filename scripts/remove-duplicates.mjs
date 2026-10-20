import { execSync, spawnSync } from "child_process";
import fs from "fs";

const BUCKET = "flavorinsight-media";
const DB_NAME = "flavorinsight-db";

console.log("=== Removing Duplicate Unused Media ===");

const media = JSON.parse(execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command "SELECT id, filename, storage_key FROM media;" --json`).toString())[0].results;
const posts = JSON.parse(execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command "SELECT content, featured_image FROM ec_posts;" --json`).toString())[0].results;
const pages = JSON.parse(execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command "SELECT content, featured_image FROM ec_pages;" --json`).toString())[0].results;
const bylines = JSON.parse(execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command "SELECT avatar_media_id FROM _emdash_bylines;" --json`).toString())[0].results;

const usedIds = new Set();
for (const b of bylines) {
  if (b.avatar_media_id) usedIds.add(b.avatar_media_id);
}
for (const p of posts) {
  const allText = (p.content || "") + " " + (p.featured_image || "");
  for (const m of media) {
    if (allText.includes(m.storage_key) || allText.includes(m.id)) {
      usedIds.add(m.id);
    }
  }
}
for (const p of pages) {
  const allText = (p.content || "") + " " + (p.featured_image || "");
  for (const m of media) {
    if (allText.includes(m.storage_key) || allText.includes(m.id)) {
      usedIds.add(m.id);
    }
  }
}
for (const m of media) {
  if (m.filename.includes("foodlogofavicon7")) {
    usedIds.add(m.id);
  }
}

const toDelete = media.filter(m => !usedIds.has(m.id));
console.log(`Found ${toDelete.length} duplicate/unused media items to remove.`);

// 1. Delete from R2
console.log("Deleting objects from Cloudflare R2...");
let delCount = 0;
for (const item of toDelete) {
  console.log(`[${++delCount}/${toDelete.length}] Deleting R2: ${item.storage_key} (${item.filename})`);
  spawnSync("npx", [
    "wrangler",
    "r2",
    "object",
    "delete",
    `${BUCKET}/${item.storage_key}`,
    "--remote"
  ], { stdio: "ignore" });
}

// 2. Delete from D1
console.log("Removing rows from D1 media table...");
const deleteSql = `DELETE FROM media WHERE id IN (${toDelete.map(d => `'${d.id}'`).join(",")});`;
fs.writeFileSync("/tmp/del_media.sql", deleteSql);
execSync(`npx wrangler d1 execute ${DB_NAME} --remote --file=/tmp/del_media.sql`);
fs.unlinkSync("/tmp/del_media.sql");

console.log("=== Duplicate Cleanup Complete! ===");
