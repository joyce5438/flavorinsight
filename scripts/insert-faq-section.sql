INSERT INTO _emdash_sections (
  id,
  slug,
  title,
  description,
  keywords,
  content,
  preview_media_id,
  source,
  theme_id,
  created_at,
  updated_at
) VALUES (
  '01M5AWVN10DXKZB776KMB55MSE',
  'faq-guide',
  '本篇重點導覽問答（FAQ）',
  '本篇重點導覽問答區段（折疊手風琴問答卡片）',
  '["faq","問答","導覽","重點"]',
  '[{"_type":"htmlBlock","_key":"faq-block-0","html":"<div class=\"faq-container my-10\" id=\"faq\">\n<h2 class=\"hub-section-title\"><i class=\"fas fa-circle-question\"></i> 本篇重點導覽問答（FAQ）</h2>\n<div class=\"faq-accordion\">\n<details class=\"faq-item\" open=\"\">\n<summary class=\"faq-summary\"><span class=\"faq-summary-q\"><span class=\"faq-q-badge\">Q1</span>為什麼說馬來西亞檳城與台灣台南的城市肌理與常民文化高度相似？</span><i class=\"fas fa-chevron-down faq-summary-icon\"></i></summary>\n<div class=\"faq-content\">\n<p>檳城喬治市與台南府城同為海港移民重要起點，皆保留了極為完整的閩南宗族廟宇、傳統街屋空間、以福建話（台語）為主的語言環境，以及將吃當作生命核心哲學的慢活步調。</p>\n</div>\n</details>\n<details class=\"faq-item\">\n<summary class=\"faq-summary\"><span class=\"faq-summary-q\"><span class=\"faq-q-badge\">Q2</span>檳城炒粿條與台南炒鱔魚意麵在烹調哲學上有何共同靈魂？</span><i class=\"fas fa-chevron-down faq-summary-icon\"></i></summary>\n<div class=\"faq-content\">\n<p>兩者皆極致講求「生猛鑊氣」與豬油／豬油渣的巧妙運用。沒了大火快炒逼出的高溫鑊氣，炒粿條與鱔魚意麵就失去了靈魂；這種對火候極致的堅持正是兩地小吃職人共通的美學標準。</p>\n</div>\n</details>\n<details class=\"faq-item\">\n<summary class=\"faq-summary\"><span class=\"faq-summary-q\"><span class=\"faq-q-badge\">Q3</span>為什麼研究台灣常民飲食與文化歷史，非常推薦走一趟檳城？</span><i class=\"fas fa-chevron-down faq-summary-icon\"></i></summary>\n<div class=\"faq-content\">\n<p>檳城保留了許多在現代台灣都市化過程中逐漸式微的古早味技法與宗族文化地景，走訪檳城就像走進一座活態常民生活博物館，能為台灣研究者提供珍貴的歷史對照坐標。</p>\n</div>\n</details>\n</div>\n</div>"}]',
  NULL,
  'theme',
  'faq-guide',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  keywords = excluded.keywords,
  content = excluded.content,
  source = excluded.source,
  theme_id = excluded.theme_id,
  updated_at = CURRENT_TIMESTAMP;
