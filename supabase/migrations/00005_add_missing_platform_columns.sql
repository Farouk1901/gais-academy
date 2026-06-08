
-- courses: add missing columns
ALTER TABLE courses
  ADD COLUMN cover_image_url     text,
  ADD COLUMN is_free             boolean NOT NULL DEFAULT false,
  ADD COLUMN is_featured         boolean NOT NULL DEFAULT false,
  ADD COLUMN category            text,
  ADD COLUMN learning_outcomes   text[] NOT NULL DEFAULT '{}';

-- videos: add missing columns
ALTER TABLE videos
  ADD COLUMN title_ar         text,
  ADD COLUMN is_protected     boolean NOT NULL DEFAULT true,
  ADD COLUMN disable_download boolean NOT NULL DEFAULT true,
  ADD COLUMN is_published     boolean NOT NULL DEFAULT false,
  ADD COLUMN watermark_text   text;

-- enrollments: add progress-tracking columns
ALTER TABLE enrollments
  ADD COLUMN completed_lessons       text[]    NOT NULL DEFAULT '{}',
  ADD COLUMN last_watched_lesson_id  uuid      REFERENCES lessons(id) ON DELETE SET NULL,
  ADD COLUMN progress_percentage     integer   NOT NULL DEFAULT 0,
  ADD COLUMN completed_at            timestamptz;

-- lessons: add order_number as alias for order_index + is_free_preview alias
ALTER TABLE lessons
  ADD COLUMN order_number      integer,
  ADD COLUMN is_free_preview   boolean NOT NULL DEFAULT false;

-- Sync order_number with order_index for existing rows
UPDATE lessons SET order_number = order_index WHERE order_number IS NULL;

-- Create receipts storage bucket policy helper
-- (bucket created separately via storage API)
