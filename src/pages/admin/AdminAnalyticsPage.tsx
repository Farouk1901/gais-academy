import { useEffect, useState } from 'react';
import { supabase } from '@/db/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number; payments: number }>>([]);
  const [studentData, setStudentData] = useState<Array<{ month: string; students: number }>>([]);
  const [courseEnrollData, setCourseEnrollData] = useState<Array<{ name: string; students: number }>>([]);
  const [levelData, setLevelData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [totals, setTotals] = useState({ revenue: 0, students: 0, courses: 0, certificates: 0 });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

      const [{ data: payments }, { data: students }, { data: enrollments }, { data: courses }, { data: certs }] = await Promise.all([
        supabase.from('payments').select('amount, status, created_at').eq('status', 'approved').gte('created_at', oneYearAgo.toISOString()),
        supabase.from('profiles').select('created_at').eq('role', 'user').gte('created_at', oneYearAgo.toISOString()),
        supabase.from('enrollments').select('course_id, courses!course_id(title_ar)'),
        supabase.from('courses').select('level'),
        supabase.from('certificates').select('id', { count: 'exact', head: true }),
      ]);

      // Monthly revenue
      const revMap: Record<string, { revenue: number; payments: number }> = {};
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        revMap[key] = { revenue: 0, payments: 0 };
      }
      (payments || []).forEach((p: { amount: number; created_at: string }) => {
        const d = new Date(p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (revMap[key]) { revMap[key].revenue += Number(p.amount); revMap[key].payments++; }
      });
      setRevenueData(Object.entries(revMap).map(([k, v]) => ({ month: MONTHS[parseInt(k.split('-')[1]) - 1], ...v })));

      // Monthly students
      const stuMap: Record<string, number> = {};
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        stuMap[key] = 0;
      }
      (students || []).forEach((s: { created_at: string }) => {
        const d = new Date(s.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (stuMap[key] !== undefined) stuMap[key]++;
      });
      setStudentData(Object.entries(stuMap).map(([k, v]) => ({ month: MONTHS[parseInt(k.split('-')[1]) - 1], students: v })));

      // Course enrollment counts
      const courseCount: Record<string, { name: string; students: number }> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (enrollments || []).forEach((e: any) => {
        const raw = e.courses;
        const title = (Array.isArray(raw) ? raw[0]?.title_ar : raw?.title_ar) || 'غير معروف';
        if (!courseCount[e.course_id]) courseCount[e.course_id] = { name: title, students: 0 };
        courseCount[e.course_id].students++;
      });
      setCourseEnrollData(Object.values(courseCount).sort((a, b) => b.students - a.students).slice(0, 8));

      // Level distribution
      const levelCount: Record<string, number> = { beginner: 0, intermediate: 0, advanced: 0 };
      (courses || []).forEach((c: { level: string }) => { if (levelCount[c.level] !== undefined) levelCount[c.level]++; });
      setLevelData([
        { name: 'مبتدئ', value: levelCount.beginner, color: 'hsl(142,70%,45%)' },
        { name: 'متوسط', value: levelCount.intermediate, color: 'hsl(38,90%,52%)' },
        { name: 'متقدم', value: levelCount.advanced, color: 'hsl(0,72%,51%)' },
      ]);

      setTotals({
        revenue: (payments || []).reduce((s: number, p: { amount: number }) => s + Number(p.amount), 0),
        students: (students || []).length,
        courses: (courses || []).length,
        certificates: (certs as unknown as { count: number })?.count || 0,
      });
      } catch (err) {
        console.error('AdminAnalyticsPage.tsx fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <AdminLayout>
    <div className="p-4 md:p-6 space-y-6">
      <div><h2 className="text-lg font-bold text-foreground font-cairo">التقارير والتحليلات</h2><p className="text-sm text-muted-foreground">نظرة تفصيلية على أداء المنصة</p></div>
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الإيرادات', value: `${totals.revenue.toLocaleString('ar-EG')} ج.م`, icon: TrendingUp, color: 'bg-warning/10 text-warning' },
          { label: 'الطلاب (سنة)', value: totals.students.toLocaleString('ar-EG'), icon: Users, color: 'bg-primary/10 text-primary' },
          { label: 'الكورسات', value: totals.courses.toLocaleString('ar-EG'), icon: BookOpen, color: 'bg-info/10 text-info' },
          { label: 'الشهادات', value: totals.certificates.toLocaleString('ar-EG'), icon: Award, color: 'bg-success/10 text-success' },
        ].map(item => (
          <Card key={item.label} className="stat-card">
            <CardContent className="p-4 flex items-start justify-between">
              <div>{loading ? <Skeleton className="h-7 w-16 bg-muted" /> : <p className="text-2xl font-bold text-foreground font-cairo">{item.value}</p>}<p className="text-xs text-muted-foreground mt-1">{item.label}</p></div>
              <div className={`admin-stat-icon shrink-0 ${item.color}`}><item.icon className="w-5 h-5" /></div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="stat-card h-full">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold font-cairo">الإيرادات الشهرية (12 شهر)</CardTitle></CardHeader>
          <CardContent>{loading ? <Skeleton className="h-52 w-full bg-muted" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={revenueData}>
                <defs><linearGradient id="revG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(210,100%,56%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(210,100%,56%)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,13%)" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(215,18%,48%)' }} />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(215,18%,48%)' }} />
                <Tooltip contentStyle={{ background: 'hsl(222,44%,6.5%)', border: '1px solid hsl(222,30%,13%)', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`${v.toLocaleString('ar-EG')} ج.م`]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(210,100%,56%)" fill="url(#revG)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}</CardContent>
        </Card>
        <Card className="stat-card h-full">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold font-cairo">تسجيل الطلاب (12 شهر)</CardTitle></CardHeader>
          <CardContent>{loading ? <Skeleton className="h-52 w-full bg-muted" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={studentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,13%)" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(215,18%,48%)' }} />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(215,18%,48%)' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'hsl(222,44%,6.5%)', border: '1px solid hsl(222,30%,13%)', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [v, 'طالب']} />
                <Line type="monotone" dataKey="students" stroke="hsl(186,100%,48%)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(186,100%,48%)' }} />
              </LineChart>
            </ResponsiveContainer>
          )}</CardContent>
        </Card>
        <Card className="stat-card h-full">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold font-cairo">أكثر الكورسات اشتراكاً</CardTitle></CardHeader>
          <CardContent>{loading ? <Skeleton className="h-52 w-full bg-muted" /> : courseEnrollData.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">لا توجد بيانات</p> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={courseEnrollData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,13%)" />
                <XAxis type="number" tick={{ fontSize: 9, fill: 'hsl(215,18%,48%)' }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: 'hsl(215,18%,48%)' }} width={90} />
                <Tooltip contentStyle={{ background: 'hsl(222,44%,6.5%)', border: '1px solid hsl(222,30%,13%)', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [v, 'طالب']} />
                <Bar dataKey="students" fill="hsl(280,65%,62%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}</CardContent>
        </Card>
        <Card className="stat-card h-full">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold font-cairo">توزيع مستويات الكورسات</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">{loading ? <Skeleton className="h-52 w-full bg-muted" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={levelData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {levelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(222,44%,6.5%)', border: '1px solid hsl(222,30%,13%)', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}</CardContent>
        </Card>
      </div>
    </div>
    </AdminLayout>
  );
}
