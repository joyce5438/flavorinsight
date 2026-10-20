INSERT INTO _emdash_sections (
  id, slug, title, description, keywords, content, preview_media_id, source, theme_id, created_at, updated_at
) VALUES (
  '01M5AYFXTS2BK4YK3J14SEZ65Y', 'card-tasting-note', '風味手札卡（Tasting Note）', '暖米羊皮紙手札風，適合主廚/作家私房風味手札與味覺筆記', '["卡片", "筆記", "風味", "note", "tasting"]', '[{"_type": "htmlBlock", "_key": "card-tasting-note-block-0", "html": "<div class=\"fi-card fi-card-tasting my-8\">\n  <div class=\"fi-card-header\">\n    <span class=\"fi-card-badge\"><i class=\"fas fa-feather-pointed\"></i> TASTING NOTE 風味筆記</span>\n  </div>\n  <div class=\"fi-card-body\">\n    <h3 class=\"fi-card-title\">蝦醬與羅望子的酸甘平衡</h3>\n    <p class=\"fi-card-text\">正宗檳城亞參叻沙的靈魂在於去骨鯖魚熬製的濃濁魚湯，伴隨新鮮薄荷葉、薑花碎與切絲黃瓜。入口初覺酸嗆開胃，尾韻則是濃郁蝦膏引出的深沉甘醇，是極致的南洋對比美學。</p>\n  </div>\n</div>"}]', NULL, 'theme', 'card-tasting-note', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
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

INSERT INTO _emdash_sections (
  id, slug, title, description, keywords, content, preview_media_id, source, theme_id, created_at, updated_at
) VALUES (
  '01M5AYFXTV2WTS6DFNVJGT164F', 'card-cultural-lore', '文史典故卡（Cultural Lore）', '墨黑炭金沉浸風格，適合歷史溯源、常民掌故與老店傳奇', '["卡片", "文史", "典故", "歷史", "lore"]', '[{"_type": "htmlBlock", "_key": "card-cultural-lore-block-0", "html": "<div class=\"fi-card fi-card-lore my-8\">\n  <div class=\"fi-card-header\">\n    <span class=\"fi-card-badge fi-badge-gold\"><i class=\"fas fa-landmark\"></i> CULTURAL LORE 文史典故</span>\n  </div>\n  <div class=\"fi-card-body\">\n    <h3 class=\"fi-card-title fi-title-gold\">十九世紀海港宗族與街頭小吃起源</h3>\n    <p class=\"fi-card-text\">十九世紀中葉華人移民大舉遷徙至檳城與台南兩地海港，碼頭苦力在繁重勞動之餘，以最平價的豬油、豆芽與麵條大火翻炒，演變成今日生猛鑊氣的街頭代表小吃。</p>\n  </div>\n</div>"}]', NULL, 'theme', 'card-cultural-lore', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
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

INSERT INTO _emdash_sections (
  id, slug, title, description, keywords, content, preview_media_id, source, theme_id, created_at, updated_at
) VALUES (
  '01M5AYFXTVEZZC115P59HQK6Q4', 'card-venue-guide', '老饕嚴選名店指南卡（Venue Guide）', '現代美食雜誌風雙欄排版，適合推薦名店、招牌必點與營業資訊', '["卡片", "店家", "指南", "推薦", "名店", "venue"]', '[{"_type": "htmlBlock", "_key": "card-venue-guide-block-0", "html": "<div class=\"fi-card fi-card-venue my-8\">\n  <div class=\"fi-card-header\">\n    <div class=\"fi-card-badge fi-badge-accent\"><i class=\"fas fa-star\"></i> 老饕嚴選推薦</div>\n    <span class=\"fi-card-meta\"><i class=\"fas fa-location-dot\"></i> 喬治市古蹟核心區</span>\n  </div>\n  <div class=\"fi-card-body\">\n    <h3 class=\"fi-card-title\">暹羅路炭火炒粿條（Siam Road Char Koay Teow）</h3>\n    <div class=\"fi-card-tags\">\n      <span class=\"fi-tag\">招牌必點：鴨蛋加辣炒粿條</span>\n      <span class=\"fi-tag\">推薦時段：平日下午 2:00</span>\n      <span class=\"fi-tag\">推薦度：★★★★★</span>\n    </div>\n    <p class=\"fi-card-text\">高齡七十多歲的謝師傅以古法木炭爐快炒，每鍋僅炒一至兩盤。炭火高溫逼出濃烈鑊氣，鴨蛋香與自製豬油渣交織，是檳城街頭極致工藝的代表作。</p>\n  </div>\n</div>"}]', NULL, 'theme', 'card-venue-guide', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
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

INSERT INTO _emdash_sections (
  id, slug, title, description, keywords, content, preview_media_id, source, theme_id, created_at, updated_at
) VALUES (
  '01M5AYFXTV0K8MDXP8RX7E1R7W', 'card-artisan-quote', '職人金句引言卡（Artisan Quote）', '巨型雙引號浮水印排版，適合主廚名言、老手藝人料理哲學與傳承對話', '["卡片", "引言", "金句", "職人", "語錄", "quote"]', '[{"_type": "htmlBlock", "_key": "card-artisan-quote-block-0", "html": "<div class=\"fi-card fi-card-quote my-8\">\n  <div class=\"fi-quote-mark\">“</div>\n  <blockquote class=\"fi-quote-content\">\n    「火候不能急，鐵鍋夠熱、油爆要脆，鑊氣是一口氣逼出來的，多一秒就焦，少一秒就死。」\n  </blockquote>\n  <div class=\"fi-quote-author\">\n    <span class=\"fi-author-name\">謝國樑</span>\n    <span class=\"fi-author-title\">—— 檳城七十年炭火炒粿條 掌杓職人</span>\n  </div>\n</div>"}]', NULL, 'theme', 'card-artisan-quote', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
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

INSERT INTO _emdash_sections (
  id, slug, title, description, keywords, content, preview_media_id, source, theme_id, created_at, updated_at
) VALUES (
  '01M5AYFXTVV8ZPP6ZKYSKNYS0E', 'card-pro-tip', '賞味訣竅與警示卡（Pro Tip）', '暖蜜琥珀警示風格，適合黃金賞味時間、點餐暗語與避坑指南', '["卡片", "訣竅", "提醒", "警示", "tip", "callout"]', '[{"_type": "htmlBlock", "_key": "card-pro-tip-block-0", "html": "<div class=\"fi-card fi-card-tip my-8\">\n  <div class=\"fi-card-header\">\n    <span class=\"fi-card-badge fi-badge-amber\"><i class=\"fas fa-fire-flame-curved\"></i> PRO TIP 賞味秘訣</span>\n  </div>\n  <div class=\"fi-card-body\">\n    <h3 class=\"fi-card-title\">黃金賞味三分鐘與點餐暗語</h3>\n    <ul class=\"fi-card-list\">\n      <li><strong>趁熱即食：</strong>出鍋後三分鐘內豬油渣仍保脆度，若外帶悶在盒子裡，鑊氣與脆度將大打折扣。</li>\n      <li><strong>在地點餐術語：</strong>請指定「加鴨蛋」（Duck Egg），鴨蛋脂香與黏稠度遠勝雞蛋，裹附粿條的口感截然不同。</li>\n      <li><strong>排隊時間預估：</strong>建議避開週末中午尖峰，平日下午兩點前至現場通常等候時間少於 20 分鐘。</li>\n    </ul>\n  </div>\n</div>"}]', NULL, 'theme', 'card-pro-tip', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
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
