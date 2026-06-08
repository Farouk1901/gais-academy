import { useEffect, useState, ComponentType } from 'react';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  BookOpen, Clock, CheckCircle, XCircle, AlertCircle,
  PlayCircle, Award, Bell, HeadphonesIcon, ChevronLeft, User
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
    { label: 'الكورسات النشطة', value: activeSubs.length, icon: BookOpen, color: 'bg-success/10 text-success', link: '/dashboard/courses' },
    { label: 'قيد الموافقة', value: pendingSubs.length, icon: Clock, color: 'bg-warning/10 text-warning', link: '/dashboard/courses' },
    { label: 'الشهادات', value: certsCount, icon: Award, color: 'bg-primary/10 text-primary', link: '/dashboard/certificates' },
    { label: 'الإشعارات الجديدة', value: notifications.length, icon: Bell, color: 'bg-info/10 text-info', link: '/dashboard/notifications' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-cairo">
            مرحباً، {profile?.full_name?.split(' ')[0] || 'طالب'} 👋
          </h2>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(s => (
          <Link key={s.label} to={s.link}>
            <Card className="stat-card card-hover h-full">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    {loading ? <Skeleton className="h-7 w-8 bg-muted mb-1" /> : <p className="text-2xl font-bold text-foreground font-cairo">{s.value}</p>}
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                  <div className={cn('admin-stat-icon shrink-0', s.color)}>
                    <s.icon className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pending subscriptions banner */}
      {pendingSubs.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-warning font-cairo">اشتراك قيد المراجعة</p>
              <p className="text-xs text-muted-foreground mt-1">
                {STATUS_CONFIG.pending_approval.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected subscriptions banner */}
      {rejectedSubs.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-destructive font-cairo">طلب اشتراك مرفوض</p>
              <p className="text-xs text-muted-foreground mt-1">{STATUS_CONFIG.rejected.message}</p>
              <Link to="/dashboard/support" className="text-xs text-primary hover:underline mt-1 block">التواصل مع الدعم ←</Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground font-cairo">كورساتي</h3>
          <Link to="/dashboard/courses" className="flex items-center gap-1 text-xs text-primary hover:underline">
            عرض الكل <ChevronLeft className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-28 w-full bg-muted rounded-lg" />)}
          </div>
        ) : subscriptions.length === 0 ? (
          <Card className="stat-card">
            <CardContent className="p-8 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground font-cairo">لا توجد كورسات بعد</p>
              <p className="text-xs text-muted-foreground mt-1">تصفح الكورسات المتاحة وابدأ رحلتك التعليمية</p>
              <Link to="/courses">
                <Button size="sm" className="mt-3">استعرض الكورسات</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subscriptions.slice(0, 4).map(sub => {
              const course = sub.courses as { id: string; title_ar: string; cover_image_url: string | null; duration_hours: number | null } | undefined;
              const config = STATUS_CONFIG[sub.status] || STATUS_CONFIG.expired;
              const StatusIcon = config.icon;
              const canAccess = sub.status === 'active';
              return (
                <Card key={sub.id} className={cn('stat-card h-full', config.cardClass)}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-16 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                        {course?.cover_image_url
                          ? <img src={course.cover_image_url} alt="" className="w-full h-full object-cover" />
                          : <BookOpen className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate font-cairo">{course?.title_ar}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusIcon className={cn('w-3.5 h-3.5', sub.status === 'active' ? 'text-success' : sub.status === 'pending_approval' ? 'text-warning' : 'text-destructive')} />
                          <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 border', config.badgeClass)}>
                            {config.label}
                          </Badge>
                        </div>
                        {sub.status === 'active' && sub.expires_at && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            ينتهي: {new Date(sub.expires_at).toLocaleDateString('ar-EG')}
                          </p>
                        )}
                      </div>
                    </div>
                    {config.message && (
                      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{config.message}</p>
                    )}
                    {canAccess && course && (
                      <Link to={`/learn/${course.id}`}>
                        <Button size="sm" className="w-full mt-2 gap-1.5 h-7 text-xs">
                          <PlayCircle className="w-3.5 h-3.5" /> متابعة التعلم
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground font-cairo">آخر الإشعارات</h3>
            <Link to="/dashboard/notifications" className="flex items-center gap-1 text-xs text-primary hover:underline">
              عرض الكل <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                <Bell className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">{n.title_ar || n.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message_ar || n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/dashboard/support">
          <Card className="stat-card card-hover h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <HeadphonesIcon className="w-8 h-8 text-primary bg-primary/10 rounded-xl p-1.5 shrink-0" />
              <div><p className="text-sm font-medium text-foreground">الدعم الفني</p><p className="text-xs text-muted-foreground">تواصل معنا</p></div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/certificates">
          <Card className="stat-card card-hover h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <Award className="w-8 h-8 text-warning bg-warning/10 rounded-xl p-1.5 shrink-0" />
              <div><p className="text-sm font-medium text-foreground">شهاداتي</p><p className="text-xs text-muted-foreground">{certsCount} شهادة</p></div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
