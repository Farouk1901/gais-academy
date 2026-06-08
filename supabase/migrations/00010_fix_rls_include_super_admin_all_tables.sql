-- ================================================================
-- Fix: extend all admin-only RLS policies to also include super_admin
-- Policies previously used = 'admin'::user_role (exact match only)
-- Now using = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])
-- ================================================================

-- Helper: single expression used in all patched policies
-- get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])

-- ── attachments ──────────────────────────────────────────────
DROP POLICY "Admins manage attachments" ON attachments;
CREATE POLICY "Admins manage attachments" ON attachments
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── categories ───────────────────────────────────────────────
DROP POLICY "Admins manage categories" ON categories;
CREATE POLICY "Admins manage categories" ON categories
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── certificates ─────────────────────────────────────────────
DROP POLICY "Admins manage certificates" ON certificates;
CREATE POLICY "Admins manage certificates" ON certificates
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── coupons ──────────────────────────────────────────────────
DROP POLICY "Admins manage coupons" ON coupons;
CREATE POLICY "Admins manage coupons" ON coupons
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── course_reviews ────────────────────────────────────────────
DROP POLICY "Admins manage reviews" ON course_reviews;
CREATE POLICY "Admins manage reviews" ON course_reviews
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── courses ───────────────────────────────────────────────────
DROP POLICY "Admins manage all courses" ON courses;
CREATE POLICY "Admins manage all courses" ON courses
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── device_sessions ──────────────────────────────────────────
DROP POLICY "Admins view all sessions" ON device_sessions;
CREATE POLICY "Admins view all sessions" ON device_sessions
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── enrollments ──────────────────────────────────────────────
DROP POLICY "Admins manage enrollments" ON enrollments;
CREATE POLICY "Admins manage enrollments" ON enrollments
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── lesson_progress ──────────────────────────────────────────
DROP POLICY "Admins view all progress" ON lesson_progress;
CREATE POLICY "Admins view all progress" ON lesson_progress
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── lessons ──────────────────────────────────────────────────
DROP POLICY "Admins manage lessons" ON lessons;
CREATE POLICY "Admins manage lessons" ON lessons
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── notifications ────────────────────────────────────────────
DROP POLICY "Admins manage notifications" ON notifications;
CREATE POLICY "Admins manage notifications" ON notifications
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── payments ─────────────────────────────────────────────────
DROP POLICY "Admins manage payments" ON payments;
CREATE POLICY "Admins manage payments" ON payments
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── profiles ─────────────────────────────────────────────────
DROP POLICY "Admins have full access to profiles" ON profiles;
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── quiz_results ─────────────────────────────────────────────
DROP POLICY "Admins view all quiz results" ON quiz_results;
CREATE POLICY "Admins view all quiz results" ON quiz_results
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── quizzes ───────────────────────────────────────────────────
DROP POLICY "Admins manage quizzes" ON quizzes;
CREATE POLICY "Admins manage quizzes" ON quizzes
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── support_tickets ───────────────────────────────────────────
DROP POLICY "Admins manage all tickets" ON support_tickets;
CREATE POLICY "Admins manage all tickets" ON support_tickets
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── ticket_replies ────────────────────────────────────────────
DROP POLICY "Ticket participants view replies" ON ticket_replies;
CREATE POLICY "Ticket participants view replies" ON ticket_replies
  FOR SELECT TO authenticated
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_replies.ticket_id
        AND support_tickets.student_id = auth.uid()
    )
    OR get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])
  );

-- ── videos ────────────────────────────────────────────────────
DROP POLICY "Admins manage videos" ON videos;
CREATE POLICY "Admins manage videos" ON videos
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- ── admin_activity_logs INSERT ───────────────────────────────
-- Currently open to all authenticated users; restrict to admin/super_admin only
DROP POLICY "Admins insert activity logs" ON admin_activity_logs;
CREATE POLICY "Admins insert activity logs" ON admin_activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));