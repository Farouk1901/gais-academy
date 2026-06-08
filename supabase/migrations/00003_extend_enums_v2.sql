
-- Step 1: Extend enums only (must commit before use)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'needs_info';
ALTER TYPE enrollment_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE enrollment_status ADD VALUE IF NOT EXISTS 'rejected';
