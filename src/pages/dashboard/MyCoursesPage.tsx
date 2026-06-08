import { useEffect, useState, ComponentType } from 'react';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { BookOpen, PlayCircle, Clock, CheckCircle, XCircle, AlertCircle, ShoppingCart } from 'lucide-react';
import type { Subscription } from '@/types/types';

type SubRow = Subscription & {
  courses?: { id: string; title_ar: string; cover_image_url: string | null; duration_hours: number | null; level: string };
  payments?: { amount: number; payment_method: string };
};

const STATUS_CONFIG: Record<string, { label: string; icon: ComponentType<{ className?: string }>; badgeClass: string; message: string }> = {
  pending_approval: { label: 'قيد المراجعة', icon: Clock, badgeClass: 'bg-warning/10 text-warning border-warning/20', message: 'تم استلام بيانات الدفع وهي قيد المراجعة. سيتم تفعيل الوصول بعد الموافقة.' },
  active: { label: 'نشط', icon: CheckCircle, badgeClass: 'bg-success/10 text-success border-success/20', message: '' },
  rejected: { label: 'مرفوض', icon: XCircle, badgeClass: 'bg-destructive/10 text-destructive border-destructive/20', message: 'لم يتم قبول طلب الاشتراك. يرجى التواصل مع الدعم أو إعادة إرسال بيانات الدفع.' },
  expired: { label: 'منتهي', icon: AlertCircle, badgeClass: 'bg-muted text-muted-foreground border-border', message: 'انتهت صلاحية هذا الاشتراك. تواصل مع الإدارة لتجديده.' },
  cancelled: { label: 'ملغي', icon: AlertCircle, badgeClass: 'bg-muted text-muted-foreground border-border', message: 'تم إلغاء هذا الاشتراك.' },
};

const LEVEL_LABELS: Record<string, string> = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };
const METHOD_LABELS: Record<string, string> = { vodafone_cash: 'Vodafone Cash', instapay: 'InstaPay', bank_transfer: 'تحويل بنكي', paymob: 'Paymob', fawry: 'فوري', stripe: 'Stripe', manual: 'يدوي' };

export default function MyCoursesPage() {
  const { profile } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('subscriptions')
          .select('*, courses!course_id(id, title_ar, cover_image_url, duration_hours, level), payments!payment_id(amount, payment_method)')
          .eq('student_id', profile.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setSubscriptions((data || []) as SubRow[]);
      } catch (err) {
        console.error('MyCoursesPage fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [profile]);

  const filtered = subscriptions.filter(s => filter === 'all' ? true : s.status === filter);

  const tabs = [
    { key: 'all', label: 'الكل', count: subscriptions.length },
    { key: 'active', label: 'نشط', count: subscriptions.filter(s => s.status === 'active').length },
    { key: 'pending_approval', label: 'انتظار', count: subscriptions.filter(s => s.status === 'pending_approval').length },
    { key: 'expired', label: 'منتهي', count: subscriptions.filter(s => s.status === 'expired').length },
    { key: 'rejected', label: 'مرفوض', count: subscriptions.filter(s => s.status === 'rejected').length },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground font-cairo">كورساتي</h2>
        <p className="text-sm text-muted-foreground">جميع اشتراكاتك في الكورسات</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              filter === tab.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}>
            {tab.label}
            <span className={cn('text-[10px] px-1 rounded', filter === tab.key ? 'bg-primary-foreground/20' : 'bg-border')}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 w-full bg-muted rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="stat-card">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground font-cairo">{filter === 'all' ? 'لا توجد كورسات بعد' : 'لا يوجد كورسات في هذه الحالة'}</p>
            {filter === 'all' && (
              <>
                <p className="text-xs text-muted-foreground mt-1">تصفح الكورسات المتاحة وابدأ التسجيل</p>
                <Link to="/courses"><Button size="sm" className="mt-3 gap-1.5"><ShoppingCart className="w-3.5 h-3.5" />تصفح الكورسات</Button></Link>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(sub => {
            const course = sub.courses as { id: string; title_ar: string; cover_image_url: string | null; duration_hours: number | null; level: string } | undefined;
            const payment = sub.payments as { amount: number; payment_method: string } | undefined;
            const config = STATUS_CONFIG[sub.status] || STATUS_CONFIG.expired;
            const StatusIcon = config.icon;
            const canAccess = sub.status === 'active';
            return (
              <Card key={sub.id} className={cn('stat-card h-full flex flex-col', sub.status === 'rejected' ? 'border-destructive/20' : sub.status === 'pending_approval' ? 'border-warning/20' : '')}>
                <CardContent className="p-4 flex flex-col flex-1">
                  {/* Cover */}
                  <div className="w-full aspect-[3/1] rounded-lg bg-secondary overflow-hidden mb-3">
                    {course?.cover_image_url
                      ? <img src={course.cover_image_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-muted-foreground" /></div>}
                  </div>
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-foreground font-cairo leading-snug text-pretty">{course?.title_ar}</p>
                      <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 border shrink-0', config.badgeClass)}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground mb-2">
                      {course?.level && <span className="bg-secondary px-2 py-0.5 rounded">{LEVEL_LABELS[course.level] || course.level}</span>}
                      {course?.duration_hours && <span className="bg-secondary px-2 py-0.5 rounded">{course.duration_hours} ساعة</span>}
                      {payment && <span className="bg-secondary px-2 py-0.5 rounded">{Number(payment.amount).toLocaleString('ar-EG')} ج.م</span>}
                      {payment && <span className="bg-secondary px-2 py-0.5 rounded">{METHOD_LABELS[payment.payment_method] || payment.payment_method}</span>}
                    </div>
                    {sub.status === 'active' && sub.expires_at && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ينتهي في: {new Date(sub.expires_at).toLocaleDateString('ar-EG')}
                      </p>
                    )}
                    {config.message && (
                      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed border-r-2 border-warning/40 pr-2">{config.message}</p>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    {canAccess && course ? (
                      <Link to={`/learn/${course.id}`} className="flex-1">
                        <Button size="sm" className="w-full gap-1.5">
                          <PlayCircle className="w-3.5 h-3.5" />متابعة التعلم
                        </Button>
                      </Link>
                    ) : sub.status === 'rejected' ? (
                      <Link to="/dashboard/support" className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full border border-border text-foreground hover:bg-accent">التواصل مع الدعم</Button>
                      </Link>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
