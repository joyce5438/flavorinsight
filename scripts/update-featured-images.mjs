import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const DB_NAME = "flavorinsight-db";

// 1. Fetch all media from D1
const mediaRes = execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command "SELECT id, filename, mime_type, width, height, storage_key FROM media;" --json`).toString();
const mediaList = JSON.parse(mediaRes)[0].results;

function findMedia(targetName) {
  let decoded = decodeURIComponent(targetName);
  let base = path.basename(decoded);
  let found = mediaList.find(m => m.filename === base);
  if (found) return found;

  // strip dimension suffix
  let clean = base.replace(/-\d+x\d+(?=\.[^.]+$)/, "");
  found = mediaList.find(m => m.filename === clean);
  if (found) return found;

  // try scaled
  let ext = path.extname(clean);
  let name = path.basename(clean, ext);
  let scaled = `${name}-scaled${ext}`;
  found = mediaList.find(m => m.filename === scaled);
  if (found) return found;

  // try unscaled from scaled
  if (clean.includes("-scaled")) {
    let unscaled = clean.replace("-scaled", "");
    found = mediaList.find(m => m.filename === unscaled);
    if (found) return found;
  }

  return null;
}

// 2. Fetch the 9 posts
const postsRes = execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command "SELECT id, title, slug, featured_image FROM ec_posts WHERE title LIKE '%馬來%';\" --json`).toString();
const posts = JSON.parse(postsRes)[0].results;

const updateSql = [];
for (const post of posts) {
  let fi = post.featured_image;
  if (!fi) continue;
  let parsed;
  try {
    parsed = JSON.parse(fi);
  } catch (e) {
    continue;
  }

  let src = parsed.src || "";
  let target = findMedia(src);
  if (target) {
    const updatedFi = JSON.stringify({
      provider: "local",
      id: target.id,
      alt: post.title,
      width: target.width || 1200,
      height: target.height || 800,
      mimeType: target.mime_type || "image/jpeg",
      filename: target.filename,
      meta: {
        storageKey: target.storage_key,
      },
    }).replace(/'/g, "''");

    updateSql.push(`UPDATE ec_posts SET featured_image = '${updatedFi}' WHERE id = '${post.id}';`);
    console.log(`Updated featured_image for ${post.slug} -> ${target.filename} (${target.storage_key})`);
  } else {
    console.warn(`Could not match featured_image for ${post.slug}: ${src}`);
  }
}

if (updateSql.length > 0) {
  fs.writeFileSync("/tmp/update_fi.sql", updateSql.join("\n"));
  execSync(`npx wrangler d1 execute ${DB_NAME} --remote --file=/tmp/update_fi.sql`);
  fs.unlinkSync("/tmp/update_fi.sql");
  console.log("Featured images successfully updated in D1!");
}
