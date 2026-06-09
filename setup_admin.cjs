const { Client } = require('pg');
const c = new Client({
  connectionString: 'postgresql://postgres.gqqbssfgrvcqqkpotycs:Gais2026Academy@aws-1-eu-central-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await c.connect();
  console.log('Connected');
  
  // Update admin name
  await c.query("UPDATE public.profiles SET full_name = 'م. أحمد الجوهري' WHERE email = 'admin@gais-academy.com'");
  
  // Verify profiles
  const r = await c.query('SELECT id, email, full_name, role FROM public.profiles');
  console.log('Profiles:', JSON.stringify(r.rows, null, 2));
  
  // Enable RLS on profiles
  await c.query('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY');
  
  // Create essential RLS policies
  const policies = [
    `CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id)`,
    `CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)`,
    `CREATE POLICY IF NOT EXISTS "Admin can view all profiles" ON public.profiles FOR SELECT USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')))`,
  ];
  
  for (const p of policies) {
    try { await c.query(p); console.log('  Policy created'); } 
    catch (e) { console.log('  Policy skip:', e.message.substring(0, 80)); }
  }
  
  await c.end();
  console.log('Done!');
})();
