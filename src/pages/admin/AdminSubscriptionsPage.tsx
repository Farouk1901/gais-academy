import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logActivity } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Search, CheckCircle, XCircle, Clock, Filter, Eye,
  Calendar, MessageSquare, RefreshCw, AlertCircle
} from 'lucide-react';
import type { Subscription } from '@/types/types';
import AdminLayout from '@/components/layouts/AdminLayout';

const STATUS_LABELS: Record<string, string> = {
  pending_approval: 'انتظار الموافقة',
  active: 'نشط',
  rejected: 'مرفوض',
  expired: 'منتهي',
  cancelled: 'ملغي',
};

const STATUS_CLASS: Record<string, string> = {
  pending_approval: 'bg-warning/10 text-warning border-warning/20',
  active: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  expired: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

export default function AdminSubscriptionsPage() {
  const { profile } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Subscription | null>(null);
  const [dialogType, setDialogType] = useState<'view' | 'approve' | 'reject' | 'notes' | 'extend' | null>(null);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [extendDays, setExtendDays] = useState('30');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('subscriptions')
      .select(`
        id, student_id, course_id, payment_id, status, admin_notes,
        approved_by, approved_at, rejected_at, rejection_reason,
        starts_at, expires_at, created_at, updated_at,
        profiles!student_id(id, full_name, email, phone),
        courses!course_id(id, title_ar, price),
        payments!payment_id(id, amount, payment_method, status, receipt_url, transaction_ref)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') query = query.eq('status', statusFilter);

    const { data, error } = await query;
    if (error) { toast.error('خطأ في تحميل الاشتراكات'); }
    else setSubscriptions((data || []) as unknown as Subscription[]);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const filtered = subscriptions.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = (s.profiles as { full_name: string | null } | undefined)?.full_name || '';
    const course = (s.courses as { title_ar: string } | undefined)?.title_ar || '';
    return name.toLowerCase().includes(q) || course.toLowerCase().includes(q);
  });

  const openDialog = (sub: Subscription, type: typeof dialogType) => {
    setSelected(sub);
    setDialogType(type);
    setNotes(sub.admin_notes || '');
    setRejectionReason('');
    setExtendDays('30');
  };

  const closeDialog = () => { setSelected(null); setDialogType(null); };

  const approveSubscription = async () => {
    if (!selected || !profile) return;
    setActionLoading(true);
    try {
      const now = new Date().toISOString();
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          approved_by: profile.id,
          approved_at: now,
          starts_at: now,
          expires_at: expiresAt.toISOString(),
          admin_notes: notes || null,
        })
        .eq('id', selected.id);

      if (error) throw error;

      // Approve the linked payment too
      if (selected.payment_id) {
        await supabase.from('payments').update({ status: 'approved', approved_by: profile.id, approved_at: now })
          .eq('id', selected.payment_id);
      }

      // Create enrollment
      await supabase.from('enrollments').upsert({
        student_id: selected.student_id,
        course_id: selected.course_id,
        status: 'active',
        subscription_id: selected.id,
      }, { onConflict: 'student_id,course_id' });

      // Notify student
      await supabase.from('notifications').insert({
        recipient_id: selected.student_id,
        title: 'تم تفعيل اشتراكك',
        title_ar: 'تم تفعيل اشتراكك',
        message: `تمت الموافقة على اشتراكك في الكورس وأصبح بإمكانك الوصول إليه الآن.`,
        message_ar: `تمت الموافقة على اشتراكك في الكورس وأصبح بإمكانك الوصول إليه الآن.`,
        course_id: selected.course_id,
        is_read: false,
      });

      await logActivity(profile.id, 'approve_subscription', 'subscription', selected.id, { student_id: selected.student_id });
      toast.success('تم تفعيل الاشتراك بنجاح');
      closeDialog();
      fetchSubscriptions();
    } catch (e) {
      toast.error('فشل في تفعيل الاشتراك');
    } finally {
      setActionLoading(false);
    }
  };

  const rejectSubscription = async () => {
    if (!selected || !profile) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason || null,
          admin_notes: notes || null,
        })
        .eq('id', selected.id);

      if (error) throw error;

      if (selected.payment_id) {
        await supabase.from('payments').update({ status: 'rejected' }).eq('id', selected.payment_id);
      }

      await supabase.from('notifications').insert({
        recipient_id: selected.student_id,
        title: 'تم رفض طلب الاشتراك',
        title_ar: 'تم رفض طلب الاشتراك',
        message: rejectionReason || 'لم يتم قبول طلب اشتراكك. يرجى التواصل مع الدعم الفني.',
        message_ar: rejectionReason || 'لم يتم قبول طلب اشتراكك. يرجى التواصل مع الدعم الفني.',
        course_id: selected.course_id,
        is_read: false,
      });

      await logActivity(profile.id, 'reject_subscription', 'subscription', selected.id);
      toast.success('تم رفض الاشتراك');
      closeDialog();
      fetchSubscriptions();
    } catch {
      toast.error('فشل في رفض الاشتراك');
    } finally {
      setActionLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('subscriptions').update({ admin_notes: notes }).eq('id', selected.id);
      if (error) throw error;
      toast.success('تم حفظ الملاحظات');
      closeDialog();
      fetchSubscriptions();
    } catch (err) {
      console.error('saveNotes error:', err);
      toast.error('فشل في حفظ الملاحظات');
    } finally {
      setActionLoading(false);
    }
  };

  const extendSubscription = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const days = parseInt(extendDays) || 30;
      const current = selected.expires_at ? new Date(selected.expires_at) : new Date();
      current.setDate(current.getDate() + days);
      const { error } = await supabase.from('subscriptions').update({ expires_at: current.toISOString(), status: 'active' }).eq('id', selected.id);
      if (error) throw error;
      toast.success(`تم تمديد الاشتراك ${days} يوماً`);
      closeDialog();
      fetchSubscriptions();
    } catch (err) {
      console.error('extendSubscription error:', err);
      toast.error('فشل في تمديد الاشتراك');
    } finally {
      setActionLoading(false);
    }
  };

  const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString('ar-EG') : '—';

  return (
    <AdminLayout>
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground font-cairo">إدارة الاشتراكات</h2>
          <p className="text-sm text-muted-foreground">مراجعة والموافقة على طلبات الاشتراك</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchSubscriptions} className="border border-border shrink-0 text-foreground hover:bg-accent">
          <RefreshCw className="w-4 h-4 ml-2" />
          تحديث
        </Button>
      </div>

      {/* Filters */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="ابحث باسم الطالب أو الكورس..." value={search} onChange={e => setSearch(e.target.value)}
                className="pr-9 bg-input border-border" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-input border-border">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending_approval">انتظار الموافقة</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
                <SelectItem value="expired">منتهي</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="stat-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold font-cairo">
            الاشتراكات ({loading ? '...' : filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full max-w-full overflow-x-auto bg-card rounded-b-lg">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border">
                  {['الطالب', 'الكورس', 'طريقة الدفع', 'المبلغ', 'تاريخ الطلب', 'الحالة', 'إجراءات'].map(h => (
                    <th key={h} className="text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24 bg-muted" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-sm text-muted-foreground py-12">لا توجد اشتراكات</td></tr>
                ) : (
                  filtered.map(sub => {
                    const studentProfile = sub.profiles as { full_name: string | null; email: string | null } | undefined;
                    const course = sub.courses as { title_ar: string; price: number } | undefined;
                    const payment = sub.payments as { amount: number; payment_method: string } | undefined;
                    return (
                      <tr key={sub.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground whitespace-nowrap">{studentProfile?.full_name || 'مجهول'}</p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">{studentProfile?.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-foreground whitespace-nowrap max-w-[160px] truncate">{course?.title_ar}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {payment?.payment_method?.replace('_', ' ') || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                          {payment ? `${Number(payment.amount).toLocaleString('ar-EG')} ج.م` : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmt(sub.created_at)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant="outline" className={cn('text-xs border', STATUS_CLASS[sub.status])}>
                            {STATUS_LABELS[sub.status] || sub.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-foreground hover:bg-accent" title="عرض التفاصيل"
                              onClick={() => openDialog(sub, 'view')}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            {sub.status === 'pending_approval' && (
                              <>
                                <Button variant="ghost" size="icon" className="w-7 h-7 text-success hover:bg-success/10" title="موافقة"
                                  onClick={() => openDialog(sub, 'approve')}>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:bg-destructive/10" title="رفض"
                                  onClick={() => openDialog(sub, 'reject')}>
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                            {sub.status === 'active' && (
                              <Button variant="ghost" size="icon" className="w-7 h-7 text-info hover:bg-info/10" title="تمديد"
                                onClick={() => openDialog(sub, 'extend')}>
                                <Calendar className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:bg-accent" title="ملاحظات"
                              onClick={() => openDialog(sub, 'notes')}>
                              <MessageSquare className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={dialogType === 'view'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-cairo text-foreground">تفاصيل الاشتراك</DialogTitle>
          </DialogHeader>
          {selected && (() => {
            const sp = selected.profiles as { full_name: string | null; email: string | null; phone: string | null } | undefined;
            const sc = selected.courses as { title_ar: string; price: number } | undefined;
            const pay = selected.payments as { amount: number; payment_method: string; receipt_url: string | null; transaction_ref: string | null; status: string } | undefined;
            return (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="الطالب" value={sp?.full_name || 'مجهول'} />
                  <InfoRow label="البريد" value={sp?.email || '—'} />
                  <InfoRow label="الهاتف" value={sp?.phone || '—'} />
                  <InfoRow label="الكورس" value={sc?.title_ar || '—'} />
                  <InfoRow label="المبلغ" value={pay ? `${Number(pay.amount).toLocaleString('ar-EG')} ج.م` : '—'} />
                  <InfoRow label="طريقة الدفع" value={pay?.payment_method?.replace('_', ' ') || '—'} />
                  <InfoRow label="رقم المعاملة" value={pay?.transaction_ref || '—'} />
                  <InfoRow label="تاريخ الطلب" value={fmt(selected.created_at)} />
                  <InfoRow label="تاريخ الموافقة" value={fmt(selected.approved_at)} />
                  <InfoRow label="تاريخ الانتهاء" value={fmt(selected.expires_at)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الحالة</p>
                  <Badge variant="outline" className={cn('border', STATUS_CLASS[selected.status])}>
                    {STATUS_LABELS[selected.status]}
                  </Badge>
                </div>
                {selected.admin_notes && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">ملاحظات المدير</p>
                    <p className="text-sm bg-secondary/50 rounded p-2">{selected.admin_notes}</p>
                  </div>
                )}
                {selected.rejection_reason && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">سبب الرفض</p>
                    <p className="text-sm bg-destructive/10 text-destructive rounded p-2">{selected.rejection_reason}</p>
                  </div>
                )}
                {pay?.receipt_url && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">إثبات الدفع</p>
                    <a href={pay.receipt_url} target="_blank" rel="noreferrer" className="text-primary text-xs hover:underline">عرض الإيصال ↗</a>
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} className="border border-border text-foreground">إغلاق</Button>
            {selected?.status === 'pending_approval' && (
              <>
                <Button onClick={() => { closeDialog(); setTimeout(() => openDialog(selected!, 'approve'), 100); }}
                  className="bg-success/10 text-success border-success/20 hover:bg-success/20 border">موافقة</Button>
                <Button onClick={() => { closeDialog(); setTimeout(() => openDialog(selected!, 'reject'), 100); }}
                  className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 border">رفض</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={dialogType === 'approve'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-cairo text-success flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> الموافقة على الاشتراك
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">سيتم تفعيل الاشتراك وإرسال إشعار للطالب.</p>
            <Textarea placeholder="ملاحظات إضافية (اختياري)..." value={notes} onChange={e => setNotes(e.target.value)}
              className="bg-input border-border resize-none" rows={3} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={approveSubscription} disabled={actionLoading} className="bg-success text-white hover:bg-success/90">
              {actionLoading ? 'جاري الموافقة...' : 'تأكيد الموافقة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={dialogType === 'reject'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-cairo text-destructive flex items-center gap-2">
              <XCircle className="w-5 h-5" /> رفض الاشتراك
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea placeholder="سبب الرفض (اختياري)..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
              className="bg-input border-border resize-none" rows={3} />
            <Textarea placeholder="ملاحظات داخلية..." value={notes} onChange={e => setNotes(e.target.value)}
              className="bg-input border-border resize-none" rows={2} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={rejectSubscription} disabled={actionLoading} className="bg-destructive text-white hover:bg-destructive/90">
              {actionLoading ? 'جاري الرفض...' : 'تأكيد الرفض'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={dialogType === 'notes'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-cairo text-foreground">ملاحظات المدير</DialogTitle>
          </DialogHeader>
          <Textarea placeholder="أدخل ملاحظاتك..." value={notes} onChange={e => setNotes(e.target.value)}
            className="bg-input border-border resize-none" rows={5} />
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={saveNotes} disabled={actionLoading}>حفظ الملاحظات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Dialog */}
      <Dialog open={dialogType === 'extend'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-cairo text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-info" /> تمديد الاشتراك
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">تاريخ الانتهاء الحالي: {fmt(selected?.expires_at)}</p>
            <Select value={extendDays} onValueChange={setExtendDays}>
              <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 أيام</SelectItem>
                <SelectItem value="30">30 يوماً</SelectItem>
                <SelectItem value="60">60 يوماً</SelectItem>
                <SelectItem value="90">90 يوماً</SelectItem>
                <SelectItem value="180">6 أشهر</SelectItem>
                <SelectItem value="365">سنة كاملة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={extendSubscription} disabled={actionLoading}>
              {actionLoading ? 'جاري التمديد...' : 'تأكيد التمديد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AdminLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground font-medium">{value}</p>
    </div>
  );
}



