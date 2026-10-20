import fs from 'node:fs';
import path from 'node:path';

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function encodeTime(now, len = 10) {
  let str = '';
  for (let i = len - 1; i >= 0; i--) {
    const mod = now % 32;
    str = ENCODING.charAt(mod) + str;
    now = (now - mod) / 32;
  }
  return str;
}
function encodeRandom(len = 16) {
  let str = '';
  for (let i = 0; i < len; i++) {
    str += ENCODING.charAt(Math.floor(Math.random() * 32));
  }
  return str;
}
function generateUlid() {
  return encodeTime(Date.now(), 10) + encodeRandom(16);
}

const articles = [
  {
    id: "01M59K4K2Z3MFADWNXQA39GAEK",
    oldSlug: "smoothtripml1",
    newSlug: "penang-walking-notes",
    shortlink: "qa39gaek",
    title: "馬來筆記 Part.1 行路不難(上)",
    displayTitle: "馬來筆記 Part.1 行路不難(上)",
    subtitle: "【馬來西亞深度自由行】行前準備、步行觀察與殖民古建築街區散步（馬來筆記 Part 1 上）",
    tags: [
      { label: "馬來西亞自由行", slug: "malaysia-travel" },
      { label: "檳城CityWalk", slug: "penang-citywalk" },
      { label: "喬治市街拍", slug: "georgetown-street" },
      { label: "大馬行人路權", slug: "pedestrian-rights" },
    ],
    seoTitle: "【檳城 CityWalk 漫步隨筆】逃離觀光客打卡！喬治市散步、行前避坑與台馬路權觀察",
    seoDescription: "拒絕走馬看花的老套行程！深度記錄馬來西亞檳城喬治市的真實步行生活，從街區古建築的人文溫度，到台馬行人路權的犀利對比，開啟一場不討好觀光客的南洋深度漫遊。",
  },
  {
    id: "01M59K4QNWK00Z8SWY1RRYDM6Y",
    oldSlug: "smoothtripml2",
    newSlug: "malaysia-ktm-train-guide",
    shortlink: "1rrydm6y",
    title: "馬來筆記 Part.1 行路不難(中)",
    displayTitle: "馬來筆記 Part.1 行路不難(中)",
    subtitle: "【馬來西亞火車搭乘全攻略】KTM ETS Platinum 豪華列車體驗、KTMB 購票與怡保一日遊路線（馬來筆記 Part 1 中）",
    tags: [
      { label: "KTMETS攻略", slug: "ktm-ets-guide" },
      { label: "怡保一日遊", slug: "ipoh-day-trip" },
      { label: "KTMB訂票教學", slug: "ktmb-booking" },
      { label: "馬來西亞火車", slug: "malaysia-train" },
    ],
    seoTitle: "【馬來西亞火車攻略】KTM ETS Platinum 豪華列車搭乘實測：KTMB 訂票避坑與怡保一日遊",
    seoDescription: "馬來西亞火車怎麼搭？實測 KTM ETS Platinum 豪華白金商務車廂，體驗飛機艙座等級服務與極致平穩行程。內含 KTMB App 購票眉角與檳城至怡保一日遊鐵道自由行心得。",
  },
  {
    id: "01M59K4VXSA8VYD6TRHTETHB09",
    oldSlug: "smoothtripml3",
    newSlug: "malaysia-street-hospitality",
    shortlink: "htethb09",
    title: "馬來筆記 Part.1 行路不難(下)",
    displayTitle: "馬來筆記 Part.1 行路不難(下)",
    subtitle: "【馬來西亞在地人情與步行生存】炎熱氣候應對、被當地人餵食的溫暖體驗與跨族群溝通（馬來筆記 Part 1 下）",
    tags: [
      { label: "大馬茶室文化", slug: "kopitiam-culture" },
      { label: "虎咬獅", slug: "hor-ka-sai" },
      { label: "大馬人情味", slug: "malaysian-hospitality" },
      { label: "檳城街頭日常", slug: "penang-street-life" },
    ],
    seoTitle: "【大馬茶室生存指南】把茶水小販當侍酒師！虎咬獅奇妙搭配與被在地人熱情餵食的南洋人情",
    seoDescription: "在大馬熱天徒步如何生存？學會把茶室阿伯當成侍酒師，解鎖炒粿條配涼茶、福建麵搭虎咬獅的在地喝法！記錄當你真誠熱愛美食時，大馬人像「怕你餓的台灣阿嬤」般熱情餵食的溫暖實錄。",
  },
  {
    id: "01M59K504TRFVT8RE5NX8BJSHF",
    oldSlug: "livingwisdom",
    newSlug: "malaysia-multiracial-code",
    shortlink: "nx8bjshf",
    title: "馬來筆記 Part.2 折衷的共存智慧",
    displayTitle: "馬來筆記 Part.2 折衷的共存智慧",
    subtitle: "【馬來西亞多元種族社會觀察】三大族群折衷共存智慧、清真飲食分流與文化包容日常（馬來筆記 Part 2）",
    tags: [
      { label: "馬來西亞文化", slug: "malaysian-culture" },
      { label: "清真飲食分流", slug: "halal-food-code" },
      { label: "三大族群共存", slug: "multiracial-coexistence" },
      { label: "南洋生活哲學", slug: "nanyang-philosophy" },
    ],
    seoTitle: "【馬來西亞折衷智慧】三大族群如何和平共存？從清真飲食分流看見南洋社會的包容日常",
    seoDescription: "華人、馬來人與印度人如何在同一塊土地共處？從同一道菜的口味偏好，到美食街餐具分開清洗的細緻界限，深入解密馬來西亞社會在飲食與信仰上最務實動人的「折衷共存哲學」。",
  },
  {
    id: "01M59K54C4VDFVFC38HTRN8H38",
    oldSlug: "penangtotainan",
    newSlug: "penang-tainan-wok-hei",
    shortlink: "htrn8h38",
    title: "馬來筆記 Part.3 從檳城看見台南的府城味",
    displayTitle: "馬來筆記 Part.3 從檳城看見台南的府城味",
    subtitle: "【檳城喬治市與台南府城文化對照】海港移民史、閩南語系、豬油鑊氣與常民小吃風貌深度剖析（馬來筆記 Part 3）",
    tags: [
      { label: "檳城美食", slug: "penang-food" },
      { label: "台南小吃", slug: "tainan-food" },
      { label: "鑊氣", slug: "wok-hei" },
      { label: "炒粿條", slug: "char-koay-teow" },
      { label: "鱔魚意麵", slug: "eel-noodles" },
    ],
    seoTitle: "【檳城遇見台南】雙城鑊氣對照記：柴燒炒粿條的豬油香，為何讓台南人熱淚盈眶？",
    seoDescription: "為什麼台南人到了檳城會感到無比親切？深入剖析兩座海港古城的閩南移民脈絡、薄餅豬油渣，以及檳城柴燒炒粿條與台南炒鱔魚意麵那股「生猛鑊氣」背後的人間煙火靈魂。",
  },
  {
    id: "01M59K58NCCYR9YF3WSH6DXDMK",
    oldSlug: "malaysianfood1",
    newSlug: "klang-bak-kut-teh-origins",
    shortlink: "sh6dxdmk",
    title: "馬來筆記 Part4 再談馬來西亞飲食（上）",
    displayTitle: "馬來筆記 Part4 再談馬來西亞飲食（上）",
    subtitle: "【巴生肉骨茶與大馬混合麵食考】檳城福建麵混搭哲學、巴生肉骨茶職人精神與雙語招牌脈絡（馬來筆記 Part 4 上）",
    tags: [
      { label: "巴生肉骨茶", slug: "klang-bak-kut-teh" },
      { label: "乾式肉骨茶", slug: "dry-bak-kut-teh" },
      { label: "檳城福建麵", slug: "penang-hokkien-mee" },
      { label: "南洋美食考據", slug: "nanyang-food-history" },
    ],
    seoTitle: "【巴生肉骨茶溯源】移民社會的混搭美味學：走訪創始人李文地後代與乾式肉骨茶考據",
    seoDescription: "為什麼大馬小吃總愛把米粉和黃麵混在一起？揭密南洋移民為求生存而生的飲食混搭哲學，並實地造訪巴生肉骨茶創始家族「五月花」，品嚐熱騰騰瓦煲乾肉骨茶的職人底蘊。",
  },
  {
    id: "01M59K5CXB1BNS9P1Z01N1HK3V",
    oldSlug: "malaysianfood2",
    newSlug: "penang-hawker-ban-street-food",
    shortlink: "01n1hk3v",
    title: "馬來筆記 Part4 再談馬來西亞飲食（中）",
    displayTitle: "馬來筆記 Part4 再談馬來西亞飲食（中）",
    subtitle: "【東南亞餐飲出海與在地防線】中國連鎖品牌擴張、檳城禁用外勞掌廚與吉隆坡商業模式剖析（馬來筆記 Part 4 中）",
    tags: [
      { label: "檳城小吃禁外勞", slug: "penang-hawker-ban" },
      { label: "餐飲出海", slug: "fnb-expansion" },
      { label: "東南亞飲食觀察", slug: "southeast-asia-food" },
      { label: "吉隆坡餐飲競爭", slug: "kl-fnb-market" },
    ],
    seoTitle: "【餐飲出海與在地防線】中國連鎖品牌席捲東南亞！檳城為何下令「嚴禁外勞掌廚」守護古早味？",
    seoDescription: "當中國餐飲品牌大舉進軍東南亞、手搖飲挪用台灣特色，大馬在地老味道如何防守？對比檳城以法規禁外勞掌廚、守護炒粿條等 13 道傳統小吃，與吉隆坡高度商業化的自由競爭，深度剖析東南亞餐飲變局。",
  },
  {
    id: "01M59K5H2JCZH0RP0E68ASW9ZV",
    oldSlug: "malaysianfood3",
    newSlug: "ramly-burger-hainan-roots",
    shortlink: "68asw9zv",
    title: "馬來筆記 Part4 再談馬來西亞飲食（下）",
    displayTitle: "馬來筆記 Part4 再談馬來西亞飲食（下）",
    subtitle: "【大馬街頭靈魂與海南飲食脈絡】被低估的海南菜、國民宵夜 Ramly Burger 與南洋味覺記憶總結（馬來筆記 Part 4 下）",
    tags: [
      { label: "RamlyBurger", slug: "ramly-burger" },
      { label: "馬來海南菜", slug: "malay-hainan-cuisine" },
      { label: "大馬茶餐廳", slug: "malaysia-kopitiam" },
      { label: "南洋國民宵夜", slug: "nanyang-late-night-eats" },
    ],
    seoTitle: "【南洋靈魂宵夜考】被低估的馬來海南菜：深夜路邊攤 Ramly Burger 與茶餐廳的美味演變",
    seoDescription: "大馬傳奇街頭宵夜 Ramly Burger 究竟有多誘人？從路邊鐵板煎蛋包肉的罪惡滋味，回溯海南移民如何以西餐廚藝創造出海南雞扒、海南咖啡，寫下跨越族群的南洋味覺傳奇。",
  },
  {
    id: "01M59K5NA5PHCPA9ERZ0R9SN7D",
    oldSlug: "tobecontinued",
    newSlug: "malaysia-deep-travel-guide",
    shortlink: "z0r9sn7d",
    title: "馬來筆記 Part5 未完待續",
    displayTitle: "馬來筆記 Part5 未完待續",
    subtitle: "【馬來西亞深度觀察指南】吉隆坡、檳城、怡保、巴生：文化與飲食脈絡全系列導覽（馬來筆記 Part 5）",
    tags: [
      { label: "馬來西亞深度遊", slug: "malaysia-deep-travel" },
      { label: "吉隆坡交通攻略", slug: "kl-transit-guide" },
      { label: "大馬文化觀察", slug: "malaysia-cultural-notes" },
      { label: "東南亞自由行指南", slug: "southeast-asia-travel" },
    ],
    seoTitle: "【馬來西亞深度全攻略】吉隆坡、檳城、怡保、巴生：3萬字文化脈絡與飲食探索總導覽",
    seoDescription: "馬來筆記全系列 3 萬字精華總結！收錄吉隆坡捷運輕軌與 TBS 轉運站換乘秘笈，串聯檳城古城、怡保鐵道與巴生常民飲食地圖，獻給熱愛歷史、文化與美食的深度漫遊者。",
  },
];

const basePath = process.cwd();
const htmlDir = path.join(basePath, 'src/data/posts-html');
const metaPath = path.join(basePath, 'src/data/posts-meta.json');

// Step 1: Replace internal links and rename HTML files
console.log('Processing HTML files...');
const slugMap = new Map(articles.map(a => [`/posts/${a.oldSlug}`, `/posts/${a.newSlug}`]));

// First read all existing HTML contents
const htmlContents = new Map();
for (const a of articles) {
  const oldFile = path.join(htmlDir, `${a.oldSlug}.html`);
  if (fs.existsSync(oldFile)) {
    let content = fs.readFileSync(oldFile, 'utf8');
    // Replace all old post links
    for (const [oldLink, newLink] of slugMap.entries()) {
      content = content.replaceAll(oldLink, newLink);
    }
    htmlContents.set(a.newSlug, content);
    fs.unlinkSync(oldFile);
  }
}

// Write new HTML files
for (const [newSlug, content] of htmlContents.entries()) {
  const newFile = path.join(htmlDir, `${newSlug}.html`);
  fs.writeFileSync(newFile, content, 'utf8');
  console.log(`Updated & renamed -> ${newSlug}.html`);
}

// Step 2: Update posts-meta.json
console.log('Updating posts-meta.json...');
const newMeta = {};
for (const a of articles) {
  newMeta[a.newSlug] = {
    title: a.title,
    displayTitle: a.displayTitle,
    subtitle: a.subtitle,
  };
}
fs.writeFileSync(metaPath, JSON.stringify(newMeta, null, 2) + '\n', 'utf8');

// Step 3: Update astro.config.mjs redirects
console.log('Updating astro.config.mjs...');
const astroConfigPath = path.join(basePath, 'astro.config.mjs');
let astroConfig = fs.readFileSync(astroConfigPath, 'utf8');

// Build redirects map
let redirectsContent = 'redirects: {\n';
for (const a of articles) {
  // Old slug without prefix -> new post URL
  redirectsContent += `\t\t"/${a.oldSlug}": "/posts/${a.newSlug}",\n`;
  // Old post URL -> new post URL
  redirectsContent += `\t\t"/posts/${a.oldSlug}": "/posts/${a.newSlug}",\n`;
  // Shortlink -> new post URL
  redirectsContent += `\t\t"/s/${a.shortlink}": "/posts/${a.newSlug}",\n`;
  // New slug shortcut without prefix -> new post URL
  redirectsContent += `\t\t"/${a.newSlug}": "/posts/${a.newSlug}",\n`;
}
redirectsContent += '\t},';

astroConfig = astroConfig.replace(/redirects:\s*\{[\s\S]*?\},/, redirectsContent);
fs.writeFileSync(astroConfigPath, astroConfig, 'utf8');

// Step 4: Generate SQL migration for remote D1
console.log('Generating D1 SQL migration...');
const sqlLines = [];
sqlLines.push('-- D1 Migration: Slugs, Tags, Content Taxonomies, and SEO Metadata');

// 1. Update ec_posts slugs
for (const a of articles) {
  sqlLines.push(`UPDATE ec_posts SET slug = '${a.newSlug}', updated_at = datetime('now') WHERE id = '${a.id}';`);
}

// 2. Remove old MY2024 tag from taxonomies and content_taxonomies
sqlLines.push(`DELETE FROM content_taxonomies WHERE taxonomy_id = '01M59K4EN767QBDDJ1RNAMCJGB';`);
sqlLines.push(`DELETE FROM taxonomies WHERE id = '01M59K4EN767QBDDJ1RNAMCJGB';`);

// 3. Insert unique tags
const uniqueTags = new Map();
for (const a of articles) {
  for (const t of a.tags) {
    if (!uniqueTags.has(t.slug)) {
      uniqueTags.set(t.slug, {
        id: generateUlid(),
        slug: t.slug,
        label: t.label,
      });
    }
  }
}

for (const t of uniqueTags.values()) {
  sqlLines.push(
    `INSERT INTO taxonomies (id, name, slug, label, parent_id, data, locale, translation_group, sort_order) ` +
    `VALUES ('${t.id}', 'tag', '${t.slug}', '${t.label}', NULL, NULL, 'zh-TW', '${t.id}', 0) ` +
    `ON CONFLICT (name, slug, locale) DO UPDATE SET label = excluded.label, translation_group = excluded.translation_group;`
  );
}

// 4. Insert content_taxonomies relationships
// First clean any existing tag associations for these posts to avoid duplicates
sqlLines.push(`DELETE FROM content_taxonomies WHERE collection = 'posts' AND entry_id IN (${articles.map(a => `'${a.id}'`).join(', ')}) AND taxonomy_id != '01M59K4EA0NZM6XHW20AAP6X67';`);

for (const a of articles) {
  for (const t of a.tags) {
    const tagInfo = uniqueTags.get(t.slug);
    sqlLines.push(
      `INSERT INTO content_taxonomies (collection, entry_id, taxonomy_id, status, scheduled_at, deleted_at, locale, published_at, created_at) ` +
      `VALUES ('posts', '${a.id}', '${tagInfo.id}', 'published', NULL, NULL, 'zh-TW', datetime('now'), datetime('now'));`
    );
  }
}

// 5. Update _emdash_seo
function escapeSql(str) {
  return str.replace(/'/g, "''");
}

for (const a of articles) {
  const canonical = `https://flavorinsight.com/posts/${a.newSlug}`;
  sqlLines.push(
    `INSERT INTO _emdash_seo (collection, content_id, seo_title, seo_description, seo_image, seo_canonical, seo_no_index, created_at, updated_at) ` +
    `VALUES ('posts', '${a.id}', '${escapeSql(a.seoTitle)}', '${escapeSql(a.seoDescription)}', NULL, '${canonical}', 0, datetime('now'), datetime('now')) ` +
    `ON CONFLICT (collection, content_id) DO UPDATE SET ` +
    `seo_title = excluded.seo_title, seo_description = excluded.seo_description, seo_canonical = excluded.seo_canonical, updated_at = datetime('now');`
  );
}

const sqlPath = path.join(basePath, 'scripts/d1-migration.sql');
fs.writeFileSync(sqlPath, sqlLines.join('\n') + '\n', 'utf8');
console.log('SQL Migration written to scripts/d1-migration.sql');
