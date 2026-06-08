
-- Students can create their own subscriptions (pending_approval)
CREATE POLICY "Students create subscriptions"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- Students can update their own subscriptions (progress tracking via enrollment is separate but keep here)
-- Actually students should NOT update subscriptions directly - only admins approve
-- But we do need enrollment updates for progress tracking

-- Students can create enrollments (for free courses)
CREATE POLICY "Students create enrollments"
ON enrollments FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- Students can update own enrollment progress
CREATE POLICY "Students update own enrollments"
ON enrollments FOR UPDATE
TO authenticated
USING (student_id = auth.uid());

-- Students can insert notifications (system notifications during checkout flow)
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Students can update coupon usage (increment usage_count)
CREATE POLICY "Authenticated update coupon usage"
ON coupons FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
