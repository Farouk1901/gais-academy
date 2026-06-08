import { useEffect, useState, ComponentType } from 'react';
import { supabase } from '@/db/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  BookOpen, TrendingUp, Clock, CheckCircle,
  XCircle, GraduationCap, Layers, ArrowLeft, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminLayout from '@/components/layouts/AdminLayout';

interface DashboardStats {
  totalStudents: number;
  newStudentsToday: number;
  newStudentsMonth: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalSubscriptions: number;
  pendingSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalPayments: number;
  pendingPayments: number;
  approvedPayments: number;
  rejectedPayments: number;
  totalRevenue: number;
  monthRevenue: number;
  totalCertificates: number;
  openTickets: number;
  unreadMessages: number;
}

interface RecentPayment {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  profiles?: { full_name: string | null };
  courses?: { title_ar: string };
}

interface RecentSubscription {
  id: string;
  status: string;
  created_at: string;
  profiles?: { full_name: string | null };
  courses?: { title_ar: string };
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(38,90%,52%)',
  approved: 'hsl(142,70%,45%)',
  rejected: 'hsl(0,72%,51%)',
  refunded: 'hsl(200,88%,50%)',
  needs_info: 'hsl(280,65%,62%)',
};

const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  pending_approval: 'hsl(38,90%,52%)',
  active: 'hsl(142,70%,45%)',
  rejected: 'hsl(0,72%,51%)',
  expired: 'hsl(215,18%,48%)',
  cancelled: 'hsl(215,18%,35%)',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد المراجعة', approved: 'مقبول', rejected: 'مرفوض',
  refunded: 'مسترد', needs_info: 'يحتاج معلومات',
  pending_approval: 'انتظار الموافقة', active: 'نشط', expired: 'منتهي', cancelled: 'ملغي',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  vodafone_cash: 'Vodafone Cash', instapay: 'InstaPay',
  bank_transfer: 'تحويل بنكي', paymob: 'Paymob',
  fawry: 'فوري', stripe: 'Stripe', manual: 'يدوي',
};

function StatCard({ title, value, icon: Icon, color, sub, loading }: {
  title: string; value: number | string; icon: ComponentType<{ className?: string }>;
  color: string; sub?: string; loading: boolean;
}) {
  return (
    <Card className="stat-card card-hover">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1 truncate">{title}</p>
            {loading ? (
              <Skeleton className="h-7 w-16 bg-muted" />
            ) : (
              <p className="text-2xl font-bold text-foreground font-cairo">{value.toLocaleString('ar-EG')}</p>
            )}
            {sub && !loading && (
              <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>
            )}
          </div>
          <div className={cn('admin-stat-icon shrink-0', color)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [recentSubscriptions, setRecentSubscriptions] = useState<RecentSubscription[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<Array<{ month: string; revenue: number; students: number }>>([]);
  const [paymentStatusDist, setPaymentStatusDist] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [subStatusDist, setSubStatusDist] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

      const [
        studentsRes, todayStudentsRes, monthStudentsRes,
        coursesRes, publishedCoursesRes, draftCoursesRes,
        subsRes, subStatusRes, paymentsRes, payStatusRes,
        certificatesRes, ticketsRes, recentPayRes, recentSubRes,
        unreadMessagesRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user').gte('created_at', today.toISOString()),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user').gte('created_at', monthStart.toISOString()),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('status'),
        supabase.from('payments').select('id, amount, status, created_at'),
        supabase.from('payments').select('status'),
        supabase.from('certificates').select('id', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('payments').select('id, amount, status, payment_method, created_at, profiles!student_id(full_name), courses!course_id(title_ar)').order('created_at', { ascending: false }).limit(5),
        supabase.from('subscriptions').select('id, status, created_at, profiles!student_id(full_name), courses!course_id(title_ar)').order('created_at', { ascending: false }).limit(5),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
      ]);

      // Compute revenue stats
      const allPayments = (paymentsRes.data || []) as Array<{ amount: number; status: string; created_at: string }>;
      const approvedPayments = allPayments.filter(p => p.status === 'approved');
      const totalRevenue = approvedPayments.reduce((s, p) => s + Number(p.amount), 0);
      const monthRevenue = approvedPayments
        .filter(p => new Date(p.created_at) >= monthStart)
        .reduce((s, p) => s + Number(p.amount), 0);

      // Payment status distribution
      const payStatuses = (payStatusRes.data || []) as Array<{ status: string }>;
      const payStatusCount: Record<string, number> = {};
      payStatuses.forEach(p => { payStatusCount[p.status] = (payStatusCount[p.status] || 0) + 1; });
      setPaymentStatusDist(
        Object.entries(payStatusCount).map(([s, v]) => ({
          name: STATUS_LABELS[s] || s,
          value: v,
          color: PAYMENT_STATUS_COLORS[s] || '#666',
        }))
      );

      // Subscription status distribution
      const subStatuses = (subStatusRes.data || []) as Array<{ status: string }>;
      const subStatusCount: Record<string, number> = {};
      subStatuses.forEach(s => { subStatusCount[s.status] = (subStatusCount[s.status] || 0) + 1; });
      const pendingSubs = subStatusCount['pending_approval'] || 0;
      const activeSubs = subStatusCount['active'] || 0;
      const expiredSubs = subStatusCount['expired'] || 0;
      setSubStatusDist(
        Object.entries(subStatusCount).map(([s, v]) => ({
          name: STATUS_LABELS[s] || s,
          value: v,
          color: SUBSCRIPTION_STATUS_COLORS[s] || '#666',
        }))
      );

      // Monthly revenue chart (last 6 months)
      const monthlyMap: Record<string, { revenue: number; students: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
        monthlyMap[key] = { revenue: 0, students: 0 };
        Object.defineProperty(monthlyMap[key], 'label', { value: `${monthNames[d.getMonth()]}`, writable: false });
      }
      approvedPayments.forEach(p => {
        const d = new Date(p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyMap[key]) monthlyMap[key].revenue += Number(p.amount);
      });

      // Student registrations per month
      const { data: recentStudents } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('role', 'user')
        .gte('created_at', sixMonthsAgo.toISOString());

      (recentStudents || []).forEach(s => {
        const d = new Date(s.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyMap[key]) monthlyMap[key].students++;
      });

      const monthNames2 = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
      setMonthlyRevenue(
        Object.entries(monthlyMap).map(([key, val]) => {
          const [yr, mo] = key.split('-');
          return { month: `${monthNames2[parseInt(mo) - 1]} ${yr}`, revenue: val.revenue, students: val.students };
        })
      );

      const payStatusAll = (payStatusRes.data || []) as Array<{ status: string }>;
      const pStatus: Record<string, number> = {};
      payStatusAll.forEach(p => { pStatus[p.status] = (pStatus[p.status] || 0) + 1; });

      setStats({
        totalStudents: studentsRes.count || 0,
        newStudentsToday: todayStudentsRes.count || 0,
        newStudentsMonth: monthStudentsRes.count || 0,
        totalCourses: coursesRes.count || 0,
        publishedCourses: publishedCoursesRes.count || 0,
        draftCourses: draftCoursesRes.count || 0,
        totalSubscriptions: subsRes.count || 0,
        pendingSubscriptions: pendingSubs,
        activeSubscriptions: activeSubs,
        expiredSubscriptions: expiredSubs,
        totalPayments: allPayments.length,
        pendingPayments: pStatus['pending'] || 0,
        approvedPayments: pStatus['approved'] || 0,
        rejectedPayments: pStatus['rejected'] || 0,
        totalRevenue,
        monthRevenue,
        totalCertificates: certificatesRes.count || 0,
        openTickets: ticketsRes.count || 0,
        unreadMessages: unreadMessagesRes.count || 0,
      });

      setRecentPayments((recentPayRes.data || []) as unknown as RecentPayment[]);
      setRecentSubscriptions((recentSubRes.data || []) as unknown as RecentSubscription[]);
    } finally {
      setLoading(false);
    }
  };

  const statusBadgeClass = (status: string) => {
    if (status === 'approved' || status === 'active') return 'bg-success/10 text-success border-success/20';
    if (status === 'rejected') return 'bg-destructive/10 text-destructive border-destructive/20';
    if (status === 'pending' || status === 'pending_approval') return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  return (
    <AdminLayout>
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground font-cairo">نظرة عامة</h2>
        <p className="text-sm text-muted-foreground">إحصائيات المنصة في الوقت الحقيقي</p>
      </div>

      {/* Stat Cards Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="إجمالي الطلاب" value={stats?.totalStudents ?? 0} icon={GraduationCap} color="bg-primary/10 text-primary" sub={`+${stats?.newStudentsMonth ?? 0} هذا الشهر`} loading={loading} />
        <StatCard title="الكورسات" value={stats?.totalCourses ?? 0} icon={BookOpen} color="bg-cyan/10 text-cyan-400" sub={`${stats?.publishedCourses ?? 0} منشور`} loading={loading} />
        <StatCard title="الاشتراكات النشطة" value={stats?.activeSubscriptions ?? 0} icon={Layers} color="bg-success/10 text-success" sub={`${stats?.pendingSubscriptions ?? 0} انتظار موافقة`} loading={loading} />
        <StatCard title="إجمالي الإيرادات" value={`${(stats?.totalRevenue ?? 0).toLocaleString('ar-EG')} ج.م`} icon={TrendingUp} color="bg-warning/10 text-warning" sub={`${(stats?.monthRevenue ?? 0).toLocaleString('ar-EG')} ج.م هذا الشهر`} loading={loading} />
      </div>

      {/* Stat Cards Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="مدفوعات معلقة" value={stats?.pendingPayments ?? 0} icon={Clock} color="bg-warning/10 text-warning" loading={loading} />
        <StatCard title="مدفوعات مقبولة" value={stats?.approvedPayments ?? 0} icon={CheckCircle} color="bg-success/10 text-success" loading={loading} />
        <StatCard title="مدفوعات مرفوضة" value={stats?.rejectedPayments ?? 0} icon={XCircle} color="bg-destructive/10 text-destructive" loading={loading} />
        <Link to="/admin/contact-messages" className="block">
          <StatCard title="رسائل غير مقروءة" value={stats?.unreadMessages ?? 0} icon={MessageSquare} color="bg-primary/10 text-primary" sub="رسائل التواصل" loading={loading} />
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <Card className="stat-card h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold font-cairo">الإيرادات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48 w-full bg-muted" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221,83%,53%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(221,83%,53%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(220,9%,46%)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(220,9%,46%)' }} />
                  <Tooltip
                    contentStyle={{ background: '#ffffff', border: '1px solid hsl(220,13%,91%)', color: '#111827', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: number) => [`${val.toLocaleString('ar-EG')} ج.م`, 'الإيراد']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(221,83%,53%)" fill="url(#revenueGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Student Registrations Chart */}
        <Card className="stat-card h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold font-cairo">تسجيل الطلاب الشهري</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48 w-full bg-muted" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyRevenue} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(220,9%,46%)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(220,9%,46%)' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#ffffff', border: '1px solid hsl(220,13%,91%)', color: '#111827', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: number) => [val, 'طالب جديد']}
                  />
                  <Bar dataKey="students" fill="hsl(199,89%,48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="stat-card h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold font-cairo">توزيع حالات المدفوعات</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {loading ? <Skeleton className="h-48 w-full bg-muted" /> : paymentStatusDist.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10">لا توجد بيانات</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={paymentStatusDist} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {paymentStatusDist.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid hsl(220,13%,91%)', color: '#111827', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold font-cairo">توزيع حالات الاشتراكات</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {loading ? <Skeleton className="h-48 w-full bg-muted" /> : subStatusDist.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10">لا توجد بيانات</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={subStatusDist} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {subStatusDist.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid hsl(220,13%,91%)', color: '#111827', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Payments */}
        <Card className="stat-card h-full flex flex-col">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold font-cairo">أحدث المدفوعات</CardTitle>
            <Link to="/admin/payments">
              <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                عرض الكل <ArrowLeft className="w-3 h-3" />
              </button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full bg-muted" />)}</div>
            ) : recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">لا توجد مدفوعات</p>
            ) : (
              <div className="space-y-2">
                {recentPayments.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {(p.profiles as { full_name: string | null } | undefined)?.full_name || 'مجهول'}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {(p.courses as { title_ar: string } | undefined)?.title_ar} · {PAYMENT_METHOD_LABELS[p.payment_method] || p.payment_method}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-foreground">{Number(p.amount).toLocaleString('ar-EG')} ج.م</span>
                      <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 border', statusBadgeClass(p.status))}>
                        {STATUS_LABELS[p.status] || p.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Subscriptions */}
        <Card className="stat-card h-full flex flex-col">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold font-cairo">أحدث الاشتراكات</CardTitle>
            <Link to="/admin/subscriptions">
              <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                عرض الكل <ArrowLeft className="w-3 h-3" />
              </button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full bg-muted" />)}</div>
            ) : recentSubscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">لا توجد اشتراكات</p>
            ) : (
              <div className="space-y-2">
                {recentSubscriptions.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {(s.profiles as { full_name: string | null } | undefined)?.full_name || 'مجهول'}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {(s.courses as { title_ar: string } | undefined)?.title_ar}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 border shrink-0', statusBadgeClass(s.status))}>
                      {STATUS_LABELS[s.status] || s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminLayout>
  );
}
