import { useEffect, useState, ComponentType } from 'react';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Navbar from '@/components/layouts/Navbar';
import WhatsAppFloat from '@/components/common/WhatsAppFloat';
import {
  BookOpen, Clock, CheckCircle, XCircle, AlertCircle,
  PlayCircle, Award, Bell, HeadphonesIcon, ChevronLeft,
  User, TrendingUp, Sparkles, GraduationCap, Settings, ArrowLeft
} from 'lucide-react';
import type { Subscription, Notification } from '@/types/types';

type SubRow = Subscription & {
  courses?: { id: string; title_ar: string; cover_image_url: string | null; duration_hours: number | null };
  payments?: { amount: number; payment_method: string };
};

const STATUS_CONFIG: Record<string, { label: string; icon: ComponentType<{ className?: string }>; cardClass: string; badgeClass: string; message: string }> = {
  pending_approval: {
    label: 'قيد المراجعة',
    icon: Clock,
    cardClass: 'border-warning/20 bg-warning/5',
    badgeClass: 'bg-warning/10 text-warning border-warning/20',
    message: 'تم استلام بيانات الدفع الخاصة بك وهي الآن قيد المراجعة من الإدارة. سيتم تفعيل الكورس بعد الموافقة.',
  },
  active: {
    label: 'نشط',
    icon: CheckCircle,
    cardClass: 'border-success/20',
    badgeClass: 'bg-success/10 text-success border-success/20',
    message: '',
  },
  rejected: {
    label: 'مرفوض',
    icon: XCircle,
    cardClass: 'border-destructive/20 bg-destructive/5',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
    message: 'لم يتم قبول طلب الاشتراك. يرجى التواصل مع الدعم الفني أو إعادة إرسال بيانات الدفع.',
  },
  expired: {
    label: 'منتهي',
    icon: AlertCircle,
    cardClass: 'border-border',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    message: 'انتهت صلاحية هذا الاشتراك. يمكنك التواصل مع الإدارة لتجديده.',
  },
  cancelled: {
    label: 'ملغي',
    icon: AlertCircle,
    cardClass: 'border-border',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    message: 'تم إلغاء هذا الاشتراك.',
  },
};

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubRow[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [certsCount, setCertsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [{ data: subs }, { data: notifs }, { count: certs }] = await Promise.all([
          supabase.from('subscriptions')
            .select('*, courses!course_id(id, title_ar, cover_image_url, duration_hours), payments!payment_id(amount, payment_method)')
            .eq('student_id', profile.id)
            .order('created_at', { ascending: false }),
          supabase.from('notifications')
            .select('*')
            .eq('recipient_id', profile.id)
            .eq('is_read', false)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('student_id', profile.id),
        ]);
        setSubscriptions((subs || []) as SubRow[]);
        setNotifications((notifs || []) as Notification[]);
        setCertsCount(certs || 0);
      } catch (err) {
        console.error('StudentDashboard fetchAll error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [profile]);

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const pendingSubs = subscriptions.filter(s => s.status === 'pending_approval');
  const rejectedSubs = subscriptions.filter(s => s.status === 'rejected');

  const statCards = [
    { label: 'الكورسات النشطة', value: activeSubs.length, icon: BookOpen, color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500', iconBg: 'bg-emerald-500/15', link: '/dashboard/courses' },
    { label: 'قيد الموافقة', value: pendingSubs.length, icon: Clock, color: 'from-amber-500/20 to-amber-500/5 text-amber-500', iconBg: 'bg-amber-500/15', link: '/dashboard/courses' },
    { label: 'الشهادات', value: certsCount, icon: Award, color: 'from-primary/20 to-primary/5 text-primary', iconBg: 'bg-primary/15', link: '/dashboard/certificates' },
    { label: 'الإشعارات', value: notifications.length, icon: Bell, color: 'from-violet-500/20 to-violet-500/5 text-violet-500', iconBg: 'bg-violet-500/15', link: '/dashboard/notifications' },
  ];

  const quickLinks = [
    { label: 'الدعم الفني', desc: 'تواصل مع فريق الدعم', icon: HeadphonesIcon, href: '/dashboard/support', color: 'bg-primary/10 text-primary' },
    { label: 'شهاداتي', desc: `${certsCount} شهادة مكتسبة`, icon: GraduationCap, href: '/dashboard/certificates', color: 'bg-amber-500/10 text-amber-500' },
    { label: 'إعدادات الحساب', desc: 'تعديل الملف الشخصي', icon: Settings, href: '/dashboard/profile', color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'استعرض الكورسات', desc: 'ابدأ رحلة جديدة', icon: Sparkles, href: '/courses', color: 'bg-violet-500/10 text-violet-500' },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Navbar */}
      <Navbar />

      {/* Hero Welcome */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/8 via-primary/3 to-transparent">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
                  مرحباً، {profile?.full_name?.split(' ')[0] || 'طالب'} 👋
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1 leading-relaxed">
                  {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/courses">
                <Button className="gap-2 bg-primary text-white border-0 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg px-6">
                  <Sparkles className="w-4 h-4" />
                  استعرض الكورسات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {statCards.map(s => (
            <Link key={s.label} to={s.link}>
              <Card className="h-full border border-border/50 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', s.iconBg)}>
                      <s.icon className="w-6 h-6" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                  {loading ? (
                    <Skeleton className="h-9 w-12 bg-muted mb-2" />
                  ) : (
                    <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{s.value}</p>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Pending subscriptions banner */}
        {pendingSubs.length > 0 && (
          <Card className="border-warning/30 bg-gradient-to-r from-warning/5 to-transparent overflow-hidden">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/15 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-warning mb-1">اشتراك قيد المراجعة</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {STATUS_CONFIG.pending_approval.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejected subscriptions banner */}
        {rejectedSubs.length > 0 && (
          <Card className="border-destructive/30 bg-gradient-to-r from-destructive/5 to-transparent overflow-hidden">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-destructive mb-1">طلب اشتراك مرفوض</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{STATUS_CONFIG.rejected.message}</p>
                <Link to="/dashboard/support" className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1">
                  التواصل مع الدعم <ArrowLeft className="w-3 h-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Courses */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              كورساتي
            </h2>
            <Link to="/dashboard/courses" className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
              عرض الكل <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-40 w-full bg-muted rounded-2xl" />)}
            </div>
          ) : subscriptions.length === 0 ? (
            <Card className="border-dashed border-2 border-border">
              <CardContent className="py-14 text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <BookOpen className="w-10 h-10 text-primary/50" />
                </div>
                <p className="text-lg font-bold text-foreground mb-2">لا توجد كورسات بعد</p>
                <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto leading-relaxed">
                  تصفح الكورسات المتاحة وابدأ رحلتك التعليمية في الذكاء الاصطناعي
                </p>
                <Link to="/courses">
                  <Button className="gap-2 bg-primary text-white rounded-xl px-6">
                    <Sparkles className="w-4 h-4" />
                    استعرض الكورسات
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.slice(0, 4).map(sub => {
                const course = sub.courses as { id: string; title_ar: string; cover_image_url: string | null; duration_hours: number | null } | undefined;
                const config = STATUS_CONFIG[sub.status] || STATUS_CONFIG.expired;
                const StatusIcon = config.icon;
                const canAccess = sub.status === 'active';
                return (
                  <Card key={sub.id} className={cn('h-full hover:shadow-lg transition-all duration-300 overflow-hidden', config.cardClass)}>
                    <CardContent className="p-5 md:p-6">
                      <div className="flex gap-4">
                        <div className="w-20 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                          {course?.cover_image_url
                            ? <img src={course.cover_image_url} alt="" className="w-full h-full object-cover" />
                            : <BookOpen className="w-6 h-6 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-foreground truncate mb-2">{course?.title_ar}</p>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={cn('w-4 h-4', sub.status === 'active' ? 'text-success' : sub.status === 'pending_approval' ? 'text-warning' : 'text-destructive')} />
                            <Badge variant="outline" className={cn('text-xs px-2 py-0.5 border', config.badgeClass)}>
                              {config.label}
                            </Badge>
                          </div>
                          {sub.status === 'active' && sub.expires_at && (
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                              ينتهي: {new Date(sub.expires_at).toLocaleDateString('ar-EG')}
                            </p>
                          )}
                        </div>
                      </div>
                      {config.message && (
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{config.message}</p>
                      )}
                      {canAccess && course && (
                        <Link to={`/learn/${course.id}`}>
                          <Button size="sm" className="w-full mt-4 gap-2 h-10 text-sm bg-primary text-white rounded-xl">
                            <PlayCircle className="w-4 h-4" /> متابعة التعلم
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Bell className="w-5 h-5 text-violet-500" />
                آخر الإشعارات
              </h2>
              <Link to="/dashboard/notifications" className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
                عرض الكل <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className="flex items-start gap-4 p-4 md:p-5 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground mb-1">{n.title_ar || n.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{n.message_ar || n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map(q => (
              <Link key={q.label} to={q.href}>
                <Card className="h-full border border-border/50 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-5 md:p-6 flex flex-col items-center text-center gap-3">
                    <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center', q.color)}>
                      <q.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground mb-1">{q.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{q.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <WhatsAppFloat />
    </div>
  );
}


