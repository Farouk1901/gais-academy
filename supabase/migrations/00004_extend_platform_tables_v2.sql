
-- ─── 1. Subscriptions table ─────────────────────────────────────────────
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending_approval'
    CHECK (status IN ('pending_approval','active','rejected','expired','cancelled')),
  admin_notes text,
  approved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- ─── 2. Admin activity logs ──────────────────────────────────────────────
CREATE TABLE admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── 3. Permissions table ────────────────────────────────────────────────
CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label_ar text NOT NULL,
  group_ar text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── 4. Role permissions junction ────────────────────────────────────────
CREATE TABLE role_permissions (
  role text NOT NULL,
  permission_key text NOT NULL REFERENCES permissions(key) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_key)
);

-- ─── 5. User permissions overrides ───────────────────────────────────────
CREATE TABLE user_permissions (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permission_key text NOT NULL REFERENCES permissions(key) ON DELETE CASCADE,
  granted boolean NOT NULL DEFAULT true,
  PRIMARY KEY (user_id, permission_key)
);

-- ─── 6. Platform settings ────────────────────────────────────────────────
CREATE TABLE platform_settings (
  key text PRIMARY KEY,
  value text,
  label_ar text,
  group_name text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── 7. Add admin_notes to payments ──────────────────────────────────────
ALTER TABLE payments ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS needs_info_reason text;

-- ─── 8. Add subscription_id to enrollments ───────────────────────────────
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL;

-- ─── 9. Seed permissions ─────────────────────────────────────────────────
INSERT INTO permissions (key, label_ar, group_ar) VALUES
  ('view_users','عرض المستخدمين','المستخدمون'),
  ('add_users','إضافة مستخدمين','المستخدمون'),
  ('edit_users','تعديل المستخدمين','المستخدمون'),
  ('delete_users','حذف المستخدمين','المستخدمون'),
  ('view_courses','عرض الكورسات','الكورسات'),
  ('add_courses','إضافة كورسات','الكورسات'),
  ('edit_courses','تعديل الكورسات','الكورسات'),
  ('delete_courses','حذف الكورسات','الكورسات'),
  ('publish_courses','نشر الكورسات','الكورسات'),
  ('manage_lessons','إدارة الدروس','الكورسات'),
  ('manage_videos','إدارة الفيديوهات','الكورسات'),
  ('view_payments','عرض المدفوعات','المدفوعات'),
  ('approve_payments','الموافقة على المدفوعات','المدفوعات'),
  ('reject_payments','رفض المدفوعات','المدفوعات'),
  ('view_subscriptions','عرض الاشتراكات','الاشتراكات'),
  ('approve_subscriptions','الموافقة على الاشتراكات','الاشتراكات'),
  ('reject_subscriptions','رفض الاشتراكات','الاشتراكات'),
  ('manage_coupons','إدارة الكوبونات','التسويق'),
  ('manage_certificates','إدارة الشهادات','الشهادات'),
  ('view_analytics','عرض التحليلات','التقارير'),
  ('manage_settings','إدارة الإعدادات','الإعدادات'),
  ('manage_notifications','إدارة الإشعارات','التواصل'),
  ('manage_support','إدارة الدعم الفني','التواصل'),
  ('view_logs','عرض سجلات النشاط','النظام')
ON CONFLICT (key) DO NOTHING;

-- ─── 10. Default admin role permissions ──────────────────────────────────
INSERT INTO role_permissions (role, permission_key)
SELECT 'admin', key FROM permissions
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_key)
SELECT 'super_admin', key FROM permissions
ON CONFLICT DO NOTHING;

-- ─── 11. Seed platform settings ──────────────────────────────────────────
INSERT INTO platform_settings (key, value, label_ar, group_name) VALUES
  ('platform_name','أكاديمية الجوهري للذكاء الاصطناعي','اسم المنصة','عام'),
  ('platform_name_en','Algohary AI School','اسم المنصة (إنجليزي)','عام'),
  ('platform_short_name','GAIS','الاسم المختصر','عام'),
  ('platform_email','info@gais.academy','البريد الإلكتروني','التواصل'),
  ('platform_phone','+20 100 000 0000','رقم الهاتف','التواصل'),
  ('vodafone_cash_number','01000000000','رقم Vodafone Cash','طرق الدفع'),
  ('instapay_number','01000000000','رقم InstaPay','طرق الدفع'),
  ('bank_account_name','أحمد الجوهري','اسم صاحب الحساب البنكي','طرق الدفع'),
  ('bank_account_number','000000000000','رقم الحساب البنكي','طرق الدفع'),
  ('bank_name','البنك الأهلي المصري','اسم البنك','طرق الدفع'),
  ('require_payment_approval','true','يتطلب موافقة إدارية على الدفع','الاشتراكات'),
  ('require_subscription_approval','true','يتطلب موافقة إدارية على الاشتراك','الاشتراكات')
ON CONFLICT (key) DO NOTHING;

-- ─── 12. RLS Policies ────────────────────────────────────────────────────
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own subscriptions"
  ON subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Admins manage subscriptions"
  ON subscriptions FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin','super_admin'));

CREATE POLICY "Admins view activity logs"
  ON admin_activity_logs FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin','super_admin'));

CREATE POLICY "Admins insert activity logs"
  ON admin_activity_logs FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('admin','super_admin'));

CREATE POLICY "All can view permissions"
  ON permissions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Super admins manage permissions"
  ON permissions FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "Admins view role permissions"
  ON role_permissions FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin','super_admin'));

CREATE POLICY "Super admins manage role permissions"
  ON role_permissions FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "Admins manage user permissions"
  ON user_permissions FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin','super_admin'));

CREATE POLICY "Admins view settings"
  ON platform_settings FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin','super_admin'));

CREATE POLICY "Admins manage settings"
  ON platform_settings FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin','super_admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ─── 13. Upgrade admin to super_admin ────────────────────────────────────
UPDATE profiles SET role = 'super_admin' WHERE email = 'admin@miaoda.com';

-- ─── 14. Update get_user_role to include super_admin ─────────────────────
CREATE OR REPLACE FUNCTION get_user_role(uid uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = uid;
$$;
