
-- Add video_storage_path: stores Supabase Storage path (e.g. "courses/abc/lesson-1.mp4")
-- video_url stays for external/YouTube videos
ALTER TABLE videos
  ADD COLUMN video_storage_path text;

-- Create a secure view for students that strips raw video URLs
-- Students fetch metadata only; actual URL comes via Edge Function
CREATE OR REPLACE VIEW student_video_meta AS
SELECT
  id,
  lesson_id,
  title,
  title_ar,
  duration_seconds,
  thumbnail_url,
  watermark_enabled,
  watermark_text,
  is_protected,
  disable_download,
  is_published,
  -- Indicate whether video is in storage (signed URL) or external
  CASE
    WHEN video_storage_path IS NOT NULL THEN 'storage'
    WHEN hls_url IS NOT NULL             THEN 'hls'
    WHEN video_url IS NOT NULL           THEN 'external'
    ELSE 'none'
  END AS source_type,
  created_at,
  updated_at
FROM videos;

-- Grant select on view to authenticated users
GRANT SELECT ON student_video_meta TO authenticated;
