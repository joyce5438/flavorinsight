-- 1. Fix SEO Image URLs to full media API paths with correct storage keys
UPDATE _emdash_seo
SET seo_image = (
  SELECT '/_emdash/api/media/file/' || m.storage_key
  FROM media m
  WHERE m.id = _emdash_seo.seo_image OR m.storage_key = _emdash_seo.seo_image
)
WHERE seo_image IS NOT NULL AND seo_image NOT LIKE '/%' AND seo_image NOT LIKE 'http%';

-- 2. Update content locale to zh-TW for posts and pages
UPDATE ec_posts SET locale = 'zh-TW' WHERE locale = 'en';
UPDATE ec_pages SET locale = 'zh-TW' WHERE locale = 'en';
