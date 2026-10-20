import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync, spawnSync } from "child_process";
import sharp from "sharp";
import { ulid } from "ulidx";

const GITHUB_DIR = "/tmp/flavorinsight-github/wp-content/uploads";
const BUCKET_NAME = "flavorinsight-media";
const DB_NAME = "flavorinsight-db";

console.log("=== Starting FlavorInsight Media & Link Migration ===");

// 1. Gather all files from GitHub repo
const localFiles = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else localFiles.push(full);
  }
}
walk(GITHUB_DIR);
console.log(`Found ${localFiles.length} files in ${GITHUB_DIR}`);

// 2. Fetch existing media records from D1
const d1MediaRes = execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command "SELECT id, filename, storage_key, content_hash FROM media;" --json`).toString();
const existingMedia = JSON.parse(d1MediaRes)[0].results || [];
console.log(`Found ${existingMedia.length} existing records in D1 media table.`);

const mediaByHash = new Map();
const mediaByFilename = new Map();
for (const m of existingMedia) {
  if (m.content_hash) mediaByHash.set(m.content_hash, m);
  if (m.filename) mediaByFilename.set(m.filename, m);
}

// 3. Helper to determine mime type
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".mp3":
      return "audio/mpeg";
    default:
      return "application/octet-stream";
  }
}

// 4. Identify unique files to upload
// Map of localFilePath -> { id, storageKey, filename, mimeType, size, width, height, hash }
const fileRegistry = new Map();

for (const filePath of localFiles) {
  const buffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const filename = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = getMimeType(filePath);
  const size = buffer.length;

  let id;
  let storageKey;
  let isExisting = false;

  if (mediaByHash.has(hash)) {
    const ex = mediaByHash.get(hash);
    id = ex.id;
    storageKey = ex.storage_key;
    isExisting = true;
  } else if (mediaByFilename.has(filename)) {
    const ex = mediaByFilename.get(filename);
    id = ex.id;
    storageKey = ex.storage_key;
    isExisting = true;
  } else {
    id = ulid();
    storageKey = `${id}${ext}`;
  }

  fileRegistry.set(filePath, {
    id,
    storageKey,
    filename,
    mimeType,
    size,
    hash,
    filePath,
    isExisting,
  });
}

console.log(`Indexed ${fileRegistry.size} local files.`);

// 5. Read image dimensions for images
console.log("Analyzing image metadata...");
for (const [filePath, info] of fileRegistry.entries()) {
  if (info.mimeType.startsWith("image/")) {
    try {
      const meta = await sharp(filePath).metadata();
      info.width = meta.width;
      info.height = meta.height;
    } catch (e) {
      console.warn(`Could not read metadata for ${info.filename}:`, e.message);
      info.width = null;
      info.height = null;
    }
  } else {
    info.width = null;
    info.height = null;
  }
}

// 6. Upload missing files to R2
console.log("Uploading files to Cloudflare R2...");
let uploadCount = 0;
for (const [filePath, info] of fileRegistry.entries()) {
  // Check if object exists in R2 or if it is already known
  // We can upload if not existing
  if (!info.isExisting) {
    console.log(`[${++uploadCount}] Uploading to R2: ${info.filename} -> ${info.storageKey} (${(info.size / 1024).toFixed(1)} KB)`);
    const res = spawnSync("npx", [
      "wrangler",
      "r2",
      "object",
      "put",
      `${BUCKET_NAME}/${info.storageKey}`,
      `--file=${filePath}`,
      "--remote"
    ], { stdio: "pipe" });

    if (res.status !== 0) {
      console.error(`Error uploading ${info.filename}:`, res.stderr.toString());
      throw new Error(`Failed to upload ${info.filename}`);
    }
  }
}
console.log(`R2 Uploads finished! (Uploaded ${uploadCount} new files)`);

// 7. Insert missing records into D1 media table
console.log("Syncing D1 media records...");
const sqlStatements = [];
for (const [filePath, info] of fileRegistry.entries()) {
  if (!info.isExisting) {
    const esc = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : "null");
    const now = new Date().toISOString();
    sqlStatements.push(`INSERT OR IGNORE INTO media (id, filename, mime_type, size, width, height, storage_key, content_hash, status, created_at) VALUES (${esc(info.id)}, ${esc(info.filename)}, ${esc(info.mimeType)}, ${info.size}, ${info.width || "null"}, ${info.height || "null"}, ${esc(info.storageKey)}, ${esc(info.hash)}, 'ready', ${esc(now)});`);
  }
}

if (sqlStatements.length > 0) {
  console.log(`Writing ${sqlStatements.length} statements to D1 in batches...`);
  // Write statements to temp file and execute via wrangler d1 execute --file
  const sqlFile = "/tmp/insert_media.sql";
  fs.writeFileSync(sqlFile, sqlStatements.join("\n"));
  execSync(`npx wrangler d1 execute ${DB_NAME} --remote --file=${sqlFile}`);
  fs.unlinkSync(sqlFile);
  console.log("D1 media records inserted successfully!");
} else {
  console.log("All media records already in D1.");
}

// 8. Build URL Mapping dictionary
// Resolves any old URL (with or without domain, with or without thumbnail suffix -1024x768)
// to the new /_emdash/api/media/file/<storageKey>
console.log("Building URL Map...");

function findRegistryInfo(targetFilename) {
  // Exact match
  for (const [fp, info] of fileRegistry.entries()) {
    if (info.filename === targetFilename) return info;
  }
  // Base match (remove -1024x768)
  const base = targetFilename.replace(/-\d+x\d+(?=\.[^.]+$)/, "");
  for (const [fp, info] of fileRegistry.entries()) {
    if (info.filename === base) return info;
  }
  // Try scaled variant
  const ext = path.extname(base);
  const name = path.basename(base, ext);
  const scaled = `${name}-scaled${ext}`;
  for (const [fp, info] of fileRegistry.entries()) {
    if (info.filename === scaled) return info;
  }
  return null;
}

// 9. Update Posts in D1
console.log("Fetching posts to update content...");
const postsRes = execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command "SELECT id, title, slug, content FROM ec_posts WHERE title LIKE '%馬來%';\" --json`).toString();
const posts = JSON.parse(postsRes)[0].results;

const postSlugMap = {
  "/smoothtripml1/": "/posts/smoothtripml1",
  "/smoothtripml1": "/posts/smoothtripml1",
  "/smoothtripml2/": "/posts/smoothtripml2",
  "/smoothtripml2": "/posts/smoothtripml2",
  "/smoothtripml3/": "/posts/smoothtripml3",
  "/smoothtripml3": "/posts/smoothtripml3",
  "/livingwisdom/": "/posts/livingwisdom",
  "/livingwisdom": "/posts/livingwisdom",
  "/penangtotainan/": "/posts/penangtotainan",
  "/penangtotainan": "/posts/penangtotainan",
  "/malaysianfood1/": "/posts/malaysianfood1",
  "/malaysianfood1": "/posts/malaysianfood1",
  "/malaysianfood2/": "/posts/malaysianfood2",
  "/malaysianfood2": "/posts/malaysianfood2",
  "/malaysianfood3/": "/posts/malaysianfood3",
  "/malaysianfood3": "/posts/malaysianfood3",
  "/tobecontinued/": "/posts/tobecontinued",
  "/tobecontinued": "/posts/tobecontinued",
};

const updateSqlList = [];
const publicUrlMap = {};

for (const post of posts) {
  let blocks;
  try {
    blocks = JSON.parse(post.content);
  } catch (e) {
    console.error(`Error parsing blocks for ${post.slug}:`, e.message);
    continue;
  }

  let mediaReplaced = 0;
  let linksReplaced = 0;

  for (const b of blocks) {
    // 1. Image block
    if (b._type === "image" && b.asset) {
      const origUrl = b.asset.url;
      if (origUrl) {
        const decoded = decodeURIComponent(origUrl);
        const filename = path.basename(decoded);
        const target = findRegistryInfo(filename);
        if (target) {
          const newUrl = `/_emdash/api/media/file/${target.storageKey}`;
          b.asset.url = newUrl;
          b.asset._ref = target.id;
          publicUrlMap[origUrl] = newUrl;
          mediaReplaced++;
        } else {
          console.warn(`[WARN] Could not find target file for image ${origUrl}`);
        }
      }
    }

    // 2. Audio/embed block
    if (b._type === "embed" && b.url && (b.url.includes("wp-content") || b.url.endsWith(".mp3"))) {
      const origUrl = b.url;
      const decoded = decodeURIComponent(origUrl);
      const filename = path.basename(decoded);
      const target = findRegistryInfo(filename);
      if (target) {
        const newUrl = `/_emdash/api/media/file/${target.storageKey}`;
        b.url = newUrl;
        if (b.html) {
          b.html = b.html.replace(origUrl, newUrl);
        }
        publicUrlMap[origUrl] = newUrl;
        mediaReplaced++;
      }
    }

    // 3. Links in markDefs
    if (b.markDefs) {
      for (const m of b.markDefs) {
        if (m._type === "link" && m.href) {
          // Check if href is an internal post link
          for (const [oldSlug, newSlug] of Object.entries(postSlugMap)) {
            if (m.href === oldSlug || m.href === `https://flavorinsight.com${oldSlug}` || m.href === `https://joyce5438.github.io/flavorinsight${oldSlug}`) {
              m.href = newSlug;
              linksReplaced++;
              break;
            }
          }
        }
      }
    }
  }

  console.log(`Post "${post.title}": replaced ${mediaReplaced} media items, ${linksReplaced} internal links.`);
  const updatedContent = JSON.stringify(blocks).replace(/'/g, "''");
  updateSqlList.push(`UPDATE ec_posts SET content = '${updatedContent}' WHERE id = '${post.id}';`);
}

// 10. Execute updates in D1
console.log("Applying content updates to D1...");
const updateSqlFile = "/tmp/update_posts.sql";
fs.writeFileSync(updateSqlFile, updateSqlList.join("\n"));
execSync(`npx wrangler d1 execute ${DB_NAME} --remote --file=${updateSqlFile}`);
fs.unlinkSync(updateSqlFile);
console.log("Posts updated successfully in D1!");

// 11. Save public URL map for fallback/redirects
fs.mkdirSync("./src/data", { recursive: true });
fs.writeFileSync("./src/data/media-url-map.json", JSON.stringify(publicUrlMap, null, 2));
console.log(`Saved ${Object.keys(publicUrlMap).length} URL mappings to src/data/media-url-map.json`);

console.log("=== Migration Complete! ===");
