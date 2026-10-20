import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const GITHUB_POSTS_DIR = '/tmp/flavorinsight-github/_posts';
const OUTPUT_DIR = path.resolve('src/data/posts-html');
const META_FILE = path.resolve('src/data/posts-meta.json');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 1. Fetch all media from D1 to build full filename -> R2 URL map
console.log('Fetching media table from D1...');
const d1Output = execSync('npx wrangler d1 execute flavorinsight-db --remote --json --command="SELECT id, filename, mime_type FROM media;"', {
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024
});

const d1Data = JSON.parse(d1Output);
const mediaRows = d1Data[0].results;
console.log(`Loaded ${mediaRows.length} media records from D1.`);

// Build filename lookup map
const mediaMap = new Map();
for (const row of mediaRows) {
  const ext = path.extname(row.filename);
  const targetUrl = `/_emdash/api/media/file/${row.id}${ext}`;
  
  // Exact filename
  mediaMap.set(row.filename, targetUrl);
  mediaMap.set(encodeURIComponent(row.filename), targetUrl);

  // Without extension
  const baseName = path.basename(row.filename, ext);
  mediaMap.set(baseName, targetUrl);

  // If filename has -scaled, also map without -scaled
  if (baseName.endsWith('-scaled')) {
    mediaMap.set(baseName.replace(/-scaled$/, '') + ext, targetUrl);
  }
}

// Helper to resolve media src
function resolveMedia(rawSrc) {
  let cleaned = rawSrc.replace(/^\{\{\s*site\.baseurl\s*\}\}/, '').trim();
  cleaned = cleaned.replace(/^https?:\/\/flavorinsight\.com/, '');
  
  const decoded = decodeURIComponent(cleaned);
  const fileName = path.basename(decoded);
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);

  // 1. Exact match
  if (mediaMap.has(fileName)) return mediaMap.get(fileName);

  // 2. Try removing WordPress dimension suffix like -1024x768, -768x1024, etc.
  const unDim = fileName.replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/, '$1');
  if (mediaMap.has(unDim)) return mediaMap.get(unDim);

  // 3. Try removing -scaled
  const unScaled = fileName.replace(/-scaled(\.[a-zA-Z0-9]+)$/, '$1');
  if (mediaMap.has(unScaled)) return mediaMap.get(unScaled);

  // 4. Try matching base
  if (mediaMap.has(base)) return mediaMap.get(base);

  // 5. Look for partial match
  for (const [key, val] of mediaMap.entries()) {
    if (key.includes(base) || base.includes(key)) {
      return val;
    }
  }

  console.warn(`[WARN] Could not resolve media: ${rawSrc} (basename: ${fileName})`);
  return rawSrc;
}

// Slug map for internal links
const SLUGS = [
  'smoothtripml1',
  'smoothtripml2',
  'smoothtripml3',
  'livingwisdom',
  'penangtotainan',
  'malaysianfood1',
  'malaysianfood2',
  'malaysianfood3',
  'tobecontinued'
];

const postFiles = fs.readdirSync(GITHUB_POSTS_DIR).filter(f => f.endsWith('.html'));
const meta = {};

for (const file of postFiles) {
  const fullPath = path.join(GITHUB_POSTS_DIR, file);
  const raw = fs.readFileSync(fullPath, 'utf8');

  // Parse YAML frontmatter
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) continue;

  const yaml = match[1];
  let body = match[2];

  const slugMatch = yaml.match(/^slug:\s*(.*)$/m);
  const titleMatch = yaml.match(/^title:\s*(.*)$/m);
  const displayTitleMatch = yaml.match(/^display_title:\s*(.*)$/m);

  const slug = slugMatch ? slugMatch[1].trim() : file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.html$/, '');
  const title = titleMatch ? titleMatch[1].trim().replace(/^['"](.*)['"]$/, '$1') : '';
  const displayTitle = displayTitleMatch ? displayTitleMatch[1].trim().replace(/^['"](.*)['"]$/, '$1') : title;

  meta[slug] = {
    title,
    displayTitle,
    subtitle: (title !== displayTitle) ? title : ''
  };

  // Replace media URLs in src="..."
  body = body.replace(/src=["']([^"']+)["']/g, (m, src) => {
    if (src.includes('wp-content/uploads')) {
      const resolved = resolveMedia(src);
      return `src="${resolved}"`;
    }
    return m;
  });

  // Replace internal post links
  for (const s of SLUGS) {
    // {{ site.baseurl }}/slug/ or /slug/ or https://flavorinsight.com/slug/
    const pattern = new RegExp(`href=["'](?:\\{\\{\\s*site\\.baseurl\\s*\\}\\})?(?:https?:\\/\\/flavorinsight\\.com)?\\/${s}\\/?["']`, 'g');
    body = body.replace(pattern, `href="/posts/${s}"`);
  }

  // Remove ld+json script from post body if present (already handled by Astro Base)
  body = body.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

  const outFile = path.join(OUTPUT_DIR, `${slug}.html`);
  fs.writeFileSync(outFile, body.trim() + '\n', 'utf8');
  console.log(`Saved ${slug}.html (${body.length} chars)`);
}

fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2), 'utf8');
console.log('Saved posts-meta.json');
