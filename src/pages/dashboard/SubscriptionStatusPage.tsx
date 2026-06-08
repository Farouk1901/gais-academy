import { useEffect, useState } from 'react';
import { Layers, BookOpen, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

interface SubscriptionRow {
  id: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  expires_at: string | null;
  admin_notes: string | null;
  rejection_reason: string | null;
  courses: { id: string; title_ar: string; thumbnail_url: string | null } | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; class: string }> = {
  pending_approval: {
    label: 'في انتظار الموافقة',
    icon: Clock,
    class: 'text-warning bg-warning/10 border-warning/20',
  },
  active: {
    label: 'نشط',
    icon: CheckCircle,
    class: 'text-success bg-success/10 border-success/20',
  },
  rejected: {
    label: 'مرفوض',
    icon: XCircle,
    class: 'text-destructive bg-destructive/10 border-destructive/20',
  },
  expired: {
    label: 'منتهي',
    icon: AlertCircle,
    class: 'text-muted-foreground bg-muted border-border',
  },
  cancelled: {
    label: 'ملغي',
    icon: XCircle,
    class: 'text-muted-foreground bg-muted border-border',
  },
};

const STATUS_MESSAGE: Record<string, string> = {
  pending_approval:
    'تم استلام بيانات الدفع الخاصة بك وهي الآن قيد المراجعة من الإدارة. سيتم تفعيل الكورس بعد الموافقة.',
  active: 'اشتراكك نشط، يمكنك الوصول إلى الكورس والبدء في التعلم.',
  rejected:
    'لم يتم قبول طلب الاشتراك. يرجى التواصل مع الدعم الفني أو إعادة إرسال بيانات الدفع.',
  expired: 'انتهت صلاحية الاشتراك. يمكنك تجديده للوصول مجدداً.',
  cancelled: 'تم إلغاء هذا الاشتراك.',
};

const fmt = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

export default function SubscriptionStatusPage() {
  const { profile } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(
          'id, status, created_at, approved_at, expires_at, admin_notes, rejection_reason, courses!course_id(id, title_ar, thumbnail_url)'
        )
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(Array.isArray(data) ? (data as unknown as SubscriptionRow[]) : []);
    } catch (err) {
      console.error('SubscriptionStatusPage fetch error:', err);
      toast.error('فشل في تحميل بيانات الاشتراكات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">حالة الاشتراكات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            تفاصيل جميع اشتراكاتك في الكورسات
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSubs}
          className="text-muted-foreground border-border"
        >
          <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
          تحديث
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-28 rounded-xl bg-muted" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card">
          <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground font-medium mb-2">لا توجد اشتراكات بعد</h3>
          <p className="text-muted-foreground text-sm mb-5">
            اشترك في كورس للبدء في رحلتك التعليمية
          </p>
          <Link to="/courses">
            <Button size="sm">تصفح الكورسات</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map(sub => {
            const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.cancelled;
            const StatusIcon = cfg.icon;
            const course = sub.courses;

            return (
              <div
                key={sub.id}
                className="border border-border rounded-xl bg-card p-4 md:p-5 space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-start gap-3">
                  {/* Course thumbnail */}
                  {course?.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title_ar}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                      <BookOpen className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">
                        {course?.title_ar ?? 'كورس محذوف'}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs border shrink-0 flex items-center gap-1 ${cfg.class}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </Badge>
                    </div>

                    {/* Dates */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                      <span>تاريخ الطلب: {fmt(sub.created_at)}</span>
                      {sub.approved_at && (
                        <span>تاريخ التفعيل: {fmt(sub.approved_at)}</span>
                      )}
                      {sub.expires_at && (
                        <span>تاريخ الانتهاء: {fmt(sub.expires_at)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status message */}
                <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 border border-border text-pretty">
                  {STATUS_MESSAGE[sub.status] ?? 'حالة غير معروفة. يرجى التواصل مع الدعم الفني.'}
                </p>

                {/* Admin notes */}
                {sub.admin_notes && (
                  <div className="text-xs text-foreground bg-muted/60 border border-border rounded-lg px-3 py-2">
                    <span className="font-medium">ملاحظة الإدارة: </span>
                    {sub.admin_notes}
                  </div>
                )}

                {/* Rejection reason */}
                {sub.rejection_reason && (
                  <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                    <span className="font-medium">سبب الرفض: </span>
                    {sub.rejection_reason}
                  </div>
                )}

                {/* CTA */}
                {sub.status === 'active' && course?.id && (
                  <div>
                    <Link to={`/learn/${course.id}`}>
                      <Button size="sm" className="text-xs">
                        الدخول إلى الكورس
                      </Button>
                    </Link>
                  </div>
                )}

                {(sub.status === 'rejected' || sub.status === 'expired') && (
                  <div>
                    <Link to="/dashboard/support">
                      <Button size="sm" variant="outline" className="text-xs">
                        تواصل مع الدعم
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
