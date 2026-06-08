
-- =============================================
-- USER ROLES & PROFILES
-- =============================================
CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'instructor');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  phone text,
  full_name text,
  avatar_url text,
  role user_role NOT NULL DEFAULT 'user',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    'user'::public.user_role
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- COURSE CATEGORIES
-- =============================================
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text NOT NULL,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- COURSES
-- =============================================
CREATE TYPE public.course_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.course_status AS ENUM ('draft', 'published', 'unpublished');

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ar text NOT NULL,
  description text,
  description_ar text,
  thumbnail_url text,
  intro_video_url text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  discount_price numeric(10,2),
  level course_level NOT NULL DEFAULT 'beginner',
  status course_status NOT NULL DEFAULT 'draft',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  instructor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  instructor_name text,
  duration_hours integer DEFAULT 0,
  lessons_count integer DEFAULT 0,
  students_count integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0,
  reviews_count integer DEFAULT 0,
  what_you_learn jsonb DEFAULT '[]',
  requirements jsonb DEFAULT '[]',
  target_audience jsonb DEFAULT '[]',
  certificate_enabled boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- LESSONS
-- =============================================
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  title_ar text NOT NULL,
  description text,
  description_ar text,
  order_index integer NOT NULL DEFAULT 0,
  duration_minutes integer DEFAULT 0,
  is_preview boolean DEFAULT false,
  is_published boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- VIDEOS
-- =============================================
CREATE TYPE public.video_type AS ENUM ('upload', 'external', 'hls');
CREATE TYPE public.video_status AS ENUM ('processing', 'ready', 'hidden');

CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  title text NOT NULL,
  video_type video_type NOT NULL DEFAULT 'external',
  video_url text NOT NULL,
  hls_url text,
  thumbnail_url text,
  duration_seconds integer DEFAULT 0,
  status video_status NOT NULL DEFAULT 'ready',
  watermark_enabled boolean DEFAULT true,
  signed_url_expiry integer DEFAULT 3600,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- LESSON ATTACHMENTS
-- =============================================
CREATE TABLE public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  is_downloadable boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- QUIZZES
-- =============================================
CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  title text NOT NULL,
  title_ar text NOT NULL,
  questions jsonb DEFAULT '[]',
  pass_score integer DEFAULT 70,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- ENROLLMENTS
-- =============================================
CREATE TYPE public.enrollment_status AS ENUM ('active', 'expired', 'cancelled');

CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'active',
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(student_id, course_id)
);

-- =============================================
-- LESSON PROGRESS
-- =============================================
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  watch_time_seconds integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

-- =============================================
-- STUDENT NOTES
-- =============================================
CREATE TABLE public.student_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- COUPONS
-- =============================================
CREATE TYPE public.coupon_type AS ENUM ('percentage', 'fixed');

CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  coupon_type coupon_type NOT NULL DEFAULT 'percentage',
  discount_value numeric(10,2) NOT NULL,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  applicable_courses jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- PAYMENTS
-- =============================================
CREATE TYPE public.payment_method AS ENUM ('vodafone_cash', 'instapay', 'bank_transfer', 'paymob', 'fawry', 'stripe', 'manual');
CREATE TYPE public.payment_status AS ENUM ('pending', 'approved', 'rejected', 'refunded');

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  original_amount numeric(10,2),
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
  payment_method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  transaction_ref text,
  receipt_url text,
  notes text,
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- CERTIFICATES
-- =============================================
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number text UNIQUE NOT NULL DEFAULT 'GAIS-' || to_char(now(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999 + 1)::text, 6, '0'),
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- =============================================
-- QUIZ RESULTS
-- =============================================
CREATE TABLE public.quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb DEFAULT '[]',
  taken_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- NOTIFICATIONS
-- =============================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  title_ar text NOT NULL,
  message text NOT NULL,
  message_ar text NOT NULL,
  is_read boolean DEFAULT false,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- SUPPORT TICKETS
-- =============================================
CREATE TYPE public.ticket_status AS ENUM ('open', 'pending', 'closed');

CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- COURSE REVIEWS
-- =============================================
CREATE TABLE public.course_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- =============================================
-- DEVICE SESSIONS
-- =============================================
CREATE TABLE public.device_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_fingerprint text NOT NULL,
  last_active timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE RLS
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================
CREATE OR REPLACE FUNCTION get_user_role(uid uuid)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = uid;
$$;

CREATE OR REPLACE FUNCTION is_enrolled(uid uuid, cid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM enrollments 
    WHERE student_id = uid AND course_id = cid AND status = 'active'
  );
$$;

-- =============================================
-- PROFILES POLICIES
-- =============================================
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM get_user_role(auth.uid()));

CREATE VIEW public_profiles AS
  SELECT id, full_name, avatar_url, role FROM profiles;

-- =============================================
-- CATEGORIES POLICIES
-- =============================================
CREATE POLICY "Categories are public" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admins manage categories" ON categories
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- COURSES POLICIES
-- =============================================
CREATE POLICY "Published courses are public" ON courses
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins manage all courses" ON courses
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- LESSONS POLICIES
-- =============================================
CREATE POLICY "Preview lessons are public" ON lessons
  FOR SELECT USING (is_preview = true AND is_published = true);

CREATE POLICY "Enrolled students view lessons" ON lessons
  FOR SELECT TO authenticated USING (
    is_enrolled(auth.uid(), course_id) = true AND is_published = true
  );

CREATE POLICY "Admins manage lessons" ON lessons
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- VIDEOS POLICIES
-- =============================================
CREATE POLICY "Enrolled students can view videos" ON videos
  FOR SELECT TO authenticated USING (
    EXISTS(
      SELECT 1 FROM lessons l
      WHERE l.id = videos.lesson_id
      AND is_enrolled(auth.uid(), l.course_id) = true
    )
  );

CREATE POLICY "Admins manage videos" ON videos
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- ATTACHMENTS POLICIES
-- =============================================
CREATE POLICY "Enrolled students view attachments" ON attachments
  FOR SELECT TO authenticated USING (
    EXISTS(
      SELECT 1 FROM lessons l
      WHERE l.id = attachments.lesson_id
      AND is_enrolled(auth.uid(), l.course_id) = true
    )
  );

CREATE POLICY "Admins manage attachments" ON attachments
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- QUIZZES POLICIES
-- =============================================
CREATE POLICY "Enrolled students view quizzes" ON quizzes
  FOR SELECT TO authenticated USING (
    is_enrolled(auth.uid(), course_id) = true
  );

CREATE POLICY "Admins manage quizzes" ON quizzes
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- ENROLLMENTS POLICIES
-- =============================================
CREATE POLICY "Students view own enrollments" ON enrollments
  FOR SELECT TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Admins manage enrollments" ON enrollments
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- LESSON PROGRESS POLICIES
-- =============================================
CREATE POLICY "Students manage own progress" ON lesson_progress
  FOR ALL TO authenticated USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins view all progress" ON lesson_progress
  FOR SELECT TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- STUDENT NOTES POLICIES
-- =============================================
CREATE POLICY "Students manage own notes" ON student_notes
  FOR ALL TO authenticated USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- =============================================
-- COUPONS POLICIES
-- =============================================
CREATE POLICY "Authenticated users view active coupons" ON coupons
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins manage coupons" ON coupons
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- PAYMENTS POLICIES
-- =============================================
CREATE POLICY "Students view own payments" ON payments
  FOR SELECT TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Students create payments" ON payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins manage payments" ON payments
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- CERTIFICATES POLICIES
-- =============================================
CREATE POLICY "Students view own certificates" ON certificates
  FOR SELECT TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Admins manage certificates" ON certificates
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- QUIZ RESULTS POLICIES
-- =============================================
CREATE POLICY "Students manage own quiz results" ON quiz_results
  FOR ALL TO authenticated USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins view all quiz results" ON quiz_results
  FOR SELECT TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- NOTIFICATIONS POLICIES
-- =============================================
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT TO authenticated USING (auth.uid() = recipient_id OR recipient_id IS NULL);

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE TO authenticated USING (auth.uid() = recipient_id);

CREATE POLICY "Admins manage notifications" ON notifications
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- SUPPORT TICKETS POLICIES
-- =============================================
CREATE POLICY "Students manage own tickets" ON support_tickets
  FOR ALL TO authenticated USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins manage all tickets" ON support_tickets
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Ticket participants view replies" ON ticket_replies
  FOR SELECT TO authenticated USING (
    auth.uid() = author_id OR
    EXISTS(SELECT 1 FROM support_tickets WHERE id = ticket_replies.ticket_id AND student_id = auth.uid()) OR
    get_user_role(auth.uid()) = 'admin'::user_role
  );

CREATE POLICY "Ticket participants add replies" ON ticket_replies
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = author_id AND (
      EXISTS(SELECT 1 FROM support_tickets WHERE id = ticket_replies.ticket_id AND student_id = auth.uid()) OR
      get_user_role(auth.uid()) = 'admin'::user_role
    )
  );

-- =============================================
-- COURSE REVIEWS POLICIES
-- =============================================
CREATE POLICY "Reviews are public" ON course_reviews
  FOR SELECT USING (true);

CREATE POLICY "Enrolled students create reviews" ON course_reviews
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = student_id AND is_enrolled(auth.uid(), course_id) = true
  );

CREATE POLICY "Students update own reviews" ON course_reviews
  FOR UPDATE TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Admins manage reviews" ON course_reviews
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- DEVICE SESSIONS POLICIES
-- =============================================
CREATE POLICY "Students manage own sessions" ON device_sessions
  FOR ALL TO authenticated USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins view all sessions" ON device_sessions
  FOR SELECT TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- =============================================
-- SEED DATA - CATEGORIES
-- =============================================
INSERT INTO public.categories (name, name_ar, icon) VALUES
  ('Machine Learning', 'تعلم الآلة', 'Brain'),
  ('Deep Learning', 'التعلم العميق', 'Network'),
  ('Natural Language Processing', 'معالجة اللغة الطبيعية', 'MessageSquare'),
  ('Computer Vision', 'رؤية الحاسوب', 'Eye'),
  ('Data Science', 'علم البيانات', 'BarChart'),
  ('AI Tools & Applications', 'أدوات الذكاء الاصطناعي', 'Cpu'),
  ('Python for AI', 'بايثون للذكاء الاصطناعي', 'Code'),
  ('AI Ethics', 'أخلاقيات الذكاء الاصطناعي', 'Shield');
