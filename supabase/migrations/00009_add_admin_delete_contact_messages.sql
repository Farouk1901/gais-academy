CREATE POLICY "allow_admin_delete_contact"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])
    )
  );