import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const postsSeoData = [
  {
    id: "01M59K4K2Z3MFADWNXQA39GAEK",
    slug: "smoothtripml1",
    title: "【馬來西亞深度自由行】行前準備、步行觀察與殖民古建築街區散步（馬來筆記 Part 1 上）",
    description: "檳城朋友拜託我回台後把旅途體驗分享出來，讓更多台灣人去大馬旅遊，個人討厭走觀光客行程，也不想用旅遊部落客老套的時序類寫法，加上本身有史地、文化研究、飲食消費…的知識存量，所以打算用幾篇不同面向的主題、隨筆的方式來分享這趟大馬旅行",
    mediaId: "01M59KM20VSZQJFYPKEXSZVN2D"
  },
  {
    id: "01M59K4QNWK00Z8SWY1RRYDM6Y",
    slug: "smoothtripml2",
    title: "【馬來西亞火車搭乘全攻略】KTM ETS Platinum 豪華列車體驗、KTMB 購票與怡保一日遊路線（馬來筆記 Part 1 中）",
    description: "Platinum 列車 A 車廂的金座椅，整體設計是採用飛機座艙的概念，每個座位都有服務鈴，並有兩位服務員隨侍在這個車廂內，Platinum 只停靠大站，大站之間車程都有一個半小時以上，足夠供餐，餐點的設計比飛機整套正餐簡單，大致是飲料加點心的下午茶概念",
    mediaId: "01M59MGY8F13W8372PYWX91274"
  },
  {
    id: "01M59K4VXSA8VYD6TRHTETHB09",
    slug: "smoothtripml3",
    title: "【馬來西亞在地人情與步行生存】炎熱氣候應對、被當地人餵食的溫暖體驗與跨族群溝通（馬來筆記 Part 1 下）",
    description: "被陌生人餵食的經驗實在很特別，讓我想起怕你餓的台灣阿嬤，與台灣擔心怠慢客人的熱情周到不同，當你表露對大馬食物的由衷喜愛，大馬人就會把你當朋友般分享，而不僅僅是一個外國人、觀光客或過路人！",
    mediaId: "01M59MGY8QP21VJAVNBJD36B9B"
  },
  {
    id: "01M59K504TRFVT8RE5NX8BJSHF",
    slug: "livingwisdom",
    title: "【馬來西亞多元種族社會觀察】三大族群折衷共存智慧、清真飲食分流與文化包容日常（馬來筆記 Part 2）",
    description: "同一道菜，不同族裔有不同的側重，華人在意米的烹煮，馬來人首重辣醬的層次感，印度人則更希望能在其中吃到熟悉的傳統風味，多樣性的交融就是馬來西亞食物最有趣之處",
    mediaId: "01M59MGY7MENQB8JM2W341G5A5"
  },
  {
    id: "01M59K54C4VDFVFC38HTRN8H38",
    slug: "penangtotainan",
    title: "【檳城喬治市與台南府城文化對照】海港移民史、閩南語系、豬油鑊氣與常民小吃風貌深度剖析（馬來筆記 Part 3）",
    description: "檳城人都異常喜歡豬油、豬油渣與講求炒菜的生猛鑊氣，薄餅有豬油渣，粿條湯、福建麵也都有，檳城人對炒粿條的要求就如同台南人對待炒鱔魚意麵，沒鑊氣，料理就沒了靈魂，這點我感同身受",
    mediaId: "01M59MGY6Z8MGY1ZBCKPW316CK"
  },
  {
    id: "01M59K58NCCYR9YF3WSH6DXDMK",
    slug: "malaysianfood1",
    title: "【巴生肉骨茶與大馬混合麵食考】檳城福建麵混搭哲學、巴生肉骨茶職人精神與雙語招牌脈絡（馬來筆記 Part 4 上）",
    description: "許多看似不理性不科學的食物混搭，在移民社會是很務實的折衷做法，也許是為了應消費者提出的需要，也可能是店家為增加銷售的行銷手法，又或是一個將異鄉食材由（陌）生到熟（悉）的必然摸索過程，非移民社會也會有，只是移民社會的飲食混搭更頻繁、更見怪不怪",
    mediaId: "01M59MGY93HVGMTCKJGNBXJDRA"
  },
  {
    id: "01M59K5CXB1BNS9P1Z01N1HK3V",
    slug: "malaysianfood2",
    title: "【東南亞餐飲出海與在地防線】中國連鎖品牌擴張、檳城禁用外勞掌廚與吉隆坡商業模式剖析（馬來筆記 Part 4 中）",
    description: "檳城不成文的規定是知名的特色食物，是禁止交給外籍勞工掌廚，這展現了檳城人對傳統風味的自豪與保護，而在吉隆坡這樣國際化的現代城市，選擇將餐飲交予商業自由主義",
    mediaId: "01M59MGY72YJ7NPZRPHKG12BMT"
  },
  {
    id: "01M59K5H2JCZH0RP0E68ASW9ZV",
    slug: "malaysianfood3",
    title: "【大馬街頭靈魂與海南飲食脈絡】被低估的海南菜、國民宵夜 Ramly Burger 與南洋味覺記憶總結（馬來筆記 Part 4 下）",
    description: "馬來海南菜系的創新成果已經深深地融入了馬來西亞的飲食文化中。例如，在茶餐廳中常見的海南蒸麵包、海南咖啡、海南雞扒等，已經成為了跨越族裔界限的受歡迎美食。這些菜品不再僅僅代表海南族群，而是成為連結不同族群的紐帶。",
    mediaId: "01M59MGY8NB2NQ9JBCMVEEDBSG"
  },
  {
    id: "01M59K5NA5PHCPA9ERZ0R9SN7D",
    slug: "tobecontinued",
    title: "【馬來西亞深度觀察指南】吉隆坡、檳城、怡保、巴生：文化與飲食脈絡全系列導覽（馬來筆記 Part 5）",
    description: "想像一下，你要對一家遠在美國的陌生公司做投資決策，跟台灣企業想去開拓相對陌生的東南亞市場，又或是與 100 ~400 年前主動或被動去南洋找生計的明清先民相比，其實要面對的問題情境都是極為相似",
    mediaId: "01M59MGY742NX3FD4E4P39VZAM"
  }
];

const demoPostIds = [
  '01M59HMDV3821AE0FYAWFS2MRC',
  '01M59HMHVHX906QS9MS5FDN86H',
  '01M59HMNS0DZ4QGJMAT2ET395Z',
  '01M59HMRK35WST2XMPPWA7ZRW6',
  '01M59HMVC8E52QSY1J8NWPV705',
  '01M59HN1VYT18JKVT5T87DH13C',
  '01M59HN52H8Q3BXBTK331A0FY2',
  '01M59HN73EWFGVV3VG18JYPT37'
];

async function main() {
  console.log("=== Generating Comprehensive SEO SQL Statements ===");

  const sqlStatements = [];

  // 1. Delete Demo Posts
  const demoIdsSql = demoPostIds.map(id => `'${id}'`).join(',');
  sqlStatements.push(`DELETE FROM _emdash_content_bylines WHERE content_id IN (${demoIdsSql});`);
  sqlStatements.push(`DELETE FROM ec_posts WHERE id IN (${demoIdsSql});`);

  // 2. Clear existing _emdash_seo and insert the 9 posts
  sqlStatements.push(`DELETE FROM _emdash_seo WHERE collection = 'posts';`);

  for (const post of postsSeoData) {
    const titleEscaped = post.title.replace(/'/g, "''");
    const descEscaped = post.description.replace(/'/g, "''");
    const canonical = `https://flavorinsight.com/posts/${post.slug}`;
    const image = post.mediaId;
    sqlStatements.push(
      `INSERT INTO _emdash_seo (collection, content_id, seo_title, seo_description, seo_image, seo_canonical, seo_no_index, created_at, updated_at) VALUES ('posts', '${post.id}', '${titleEscaped}', '${descEscaped}', '${image}', '${canonical}', 0, datetime('now'), datetime('now'));`
    );
  }

  // 3. Configure site:seo in options table
  const siteSeoValue = JSON.stringify({
    titleSeparator: " | ",
    defaultOgImage: {
      mediaId: "01M59KKXRREV2BJDA4A9580BCS",
      alt: "風味洞察 From Flavor to Insight"
    },
    disallowAiTraining: false,
    robotsTxt: "User-agent: *\nAllow: /\n\nSitemap: https://flavorinsight.com/sitemap.xml\nSitemap: https://flavorinsight.com/sitemap-posts.xml"
  }).replace(/'/g, "''");

  sqlStatements.push(
    `INSERT INTO options (name, value, revision) VALUES ('site:seo', '${siteSeoValue}', '1') ON CONFLICT(name) DO UPDATE SET value = '${siteSeoValue}', revision = revision + 1;`
  );

  // 4. Configure Joost de Valk's SEO plugin in options table
  const pluginSeoSettings = [
    { key: "siteRepresents", val: "person" },
    { key: "separator", val: " | " },
    { key: "defaultDescription", val: "風味洞察 From Flavor to Insight — 由 Austin 撰寫，以個人深度視角探索馬來西亞與台灣的飲食文化、歷史脈絡與在地滋味。深度剖析檳城與台南文化對照、巴生肉骨茶、大馬火車自由行全攻略與多元種族社會觀察。" },
    { key: "personName", val: "Austin" },
    { key: "personDescription", val: "飲食與文化觀察家，熱愛透過味覺、街頭常民小吃與歷史脈絡，深度記錄馬來西亞與台灣的飲食文化與常民生活。" },
    { key: "personJobTitle", val: "飲食文化觀察家 / 自由作家" },
    { key: "personUrl", val: "https://flavorinsight.com/about" },
    { key: "personImageUrl", val: "https://flavorinsight.com/_emdash/api/media/file/01M59KKXRREV2BJDA4A9580BCS" },
    { key: "blogUrl", val: "https://flavorinsight.com/posts" },
    { key: "blogName", val: "風味洞察 From Flavor to Insight" },
    { key: "indexnowEnabled", val: "true" },
    { key: "llmsTxtEnabled", val: "true" },
    { key: "llmsTxtDescription", val: "風味洞察（From Flavor to Insight）是專注於馬來西亞、東南亞與台灣飲食文化、常民歷史與深度觀察的獨立原創專欄。" }
  ];

  for (const item of pluginSeoSettings) {
    const optName = `plugin:seo:settings:${item.key}`;
    const optVal = JSON.stringify(item.val).replace(/'/g, "''");
    sqlStatements.push(
      `INSERT INTO options (name, value, revision) VALUES ('${optName}', '${optVal}', '1') ON CONFLICT(name) DO UPDATE SET value = '${optVal}', revision = revision + 1;`
    );
  }

  const fullSql = sqlStatements.join('\n');
  const tempSqlFile = path.resolve('/tmp/apply-seo.sql');
  fs.writeFileSync(tempSqlFile, fullSql, 'utf-8');
  console.log(`Saved SQL migration to ${tempSqlFile}`);

  // 4. Execute on remote D1
  console.log("=== Applying SEO configuration to Remote Cloudflare D1 ===");
  execSync(`npx wrangler d1 execute flavorinsight-db --remote --file="${tempSqlFile}"`, { stdio: 'inherit' });
  console.log("Remote D1 SEO update SUCCESSFUL!");

  // 5. Execute on local SQLite
  console.log("=== Applying SEO configuration to Local SQLite ===");
  const d1Dir = path.resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
  if (fs.existsSync(d1Dir)) {
    const sqliteFiles = fs.readdirSync(d1Dir).filter(f => f.endsWith('.sqlite'));
    for (const file of sqliteFiles) {
      const dbPath = path.join(d1Dir, file);
      execSync(`sqlite3 "${dbPath}" < "${tempSqlFile}"`, { stdio: 'inherit' });
      console.log(`Updated local SQLite database: ${file}`);
    }
  }

  console.log("=== All SEO configurations applied successfully! ===");
}

main().catch(err => {
  console.error("Failed to setup SEO:", err);
  process.exit(1);
});
