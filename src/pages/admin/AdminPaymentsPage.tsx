import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import { useAuth, logActivity } from '@/contexts/AuthContext';
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
import { Search, CheckCircle, XCircle, Eye, RefreshCw, Filter, ExternalLink, AlertTriangle, RotateCcw } from 'lucide-react';
import type { Payment } from '@/types/types';
import AdminLayout from '@/components/layouts/AdminLayout';

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد المراجعة', approved: 'مقبول', rejected: 'مرفوض',
  refunded: 'مسترد', needs_info: 'يحتاج معلومات',
};
const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  refunded: 'bg-info/10 text-info border-info/20',
  needs_info: 'bg-muted text-muted-foreground border-border',
};
const METHOD_LABELS: Record<string, string> = {
  vodafone_cash: 'Vodafone Cash', instapay: 'InstaPay', bank_transfer: 'تحويل بنكي',
  paymob: 'Paymob', fawry: 'فوري', stripe: 'Stripe', manual: 'يدوي',
};

type PaymentRow = Payment & { profiles?: { full_name: string | null; email: string | null; phone: string | null }; courses?: { title_ar: string } };

export default function AdminPaymentsPage() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<PaymentRow | null>(null);
  const [dialogType, setDialogType] = useState<'view' | 'approve' | 'reject' | 'needs_info' | 'refund' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [needsInfoReason, setNeedsInfoReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('payments')
        .select('id, student_id, course_id, amount, original_amount, coupon_id, payment_method, status, transaction_ref, receipt_url, notes, admin_notes, needs_info_reason, approved_by, approved_at, created_at, updated_at, profiles!student_id(full_name, email, phone), courses!course_id(title_ar)')
        .order('created_at', { ascending: false });
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      setPayments((data || []) as unknown as PaymentRow[]);
    } catch (err) {
      console.error('fetchPayments error:', err);
      toast.error('خطأ في تحميل المدفوعات');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const filtered = payments.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = p.profiles?.full_name || '';
    const course = p.courses?.title_ar || '';
    const ref = p.transaction_ref || '';
    return name.toLowerCase().includes(q) || course.toLowerCase().includes(q) || ref.toLowerCase().includes(q);
  });

  const openDialog = (p: PaymentRow, type: typeof dialogType) => {
    setSelected(p); setDialogType(type); setAdminNotes(p.admin_notes || ''); setNeedsInfoReason('');
  };
  const closeDialog = () => { setSelected(null); setDialogType(null); };

  const updateStatus = async (status: string, extra: Record<string, unknown> = {}) => {
    if (!selected || !profile) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('payments').update({ status, admin_notes: adminNotes || null, approved_by: profile.id, approved_at: new Date().toISOString(), ...extra }).eq('id', selected.id);
      if (error) throw error;
      // If approving payment, also try approving the linked subscription
      if (status === 'approved') {
        const { data: subs } = await supabase.from('subscriptions').select('id, status').eq('payment_id', selected.id);
        if (subs && subs.length > 0 && subs[0].status === 'pending_approval') {
          toast.info('الدفع تم قبوله. يمكنك الآن الموافقة على الاشتراك من صفحة الاشتراكات.');
        }
      }
      await logActivity(profile.id, `payment_${status}`, 'payment', selected.id);
      toast.success(`تم تحديث حالة الدفع إلى: ${STATUS_LABELS[status]}`);
      closeDialog(); fetchPayments();
    } catch { toast.error('فشل في تحديث الحالة'); } finally { setActionLoading(false); }
  };

  const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <AdminLayout>
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground font-cairo">إدارة المدفوعات</h2>
          <p className="text-sm text-muted-foreground">مراجعة وإدارة جميع المدفوعات</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchPayments} className="border border-border shrink-0 text-foreground hover:bg-accent">
          <RefreshCw className="w-4 h-4 ml-2" />تحديث
        </Button>
      </div>
      {/* Filters */}
      <Card className="stat-card"><CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="ابحث بالاسم أو الكورس أو رقم المعاملة..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9 bg-input border-border" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 bg-input border-border">
              <Filter className="w-4 h-4 ml-2" /><SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
              <SelectItem value="approved">مقبول</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
              <SelectItem value="needs_info">يحتاج معلومات</SelectItem>
              <SelectItem value="refunded">مسترد</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>
      {/* Table */}
      <Card className="stat-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold font-cairo">المدفوعات ({loading ? '...' : filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="w-full max-w-full overflow-x-auto bg-card rounded-b-lg">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border">
                  {['الطالب', 'الكورس', 'طريقة الدفع', 'المبلغ', 'رقم المعاملة', 'التاريخ', 'الحالة', 'إجراءات'].map(h => (
                    <th key={h} className="text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20 bg-muted" /></td>)}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-sm text-muted-foreground py-12">لا توجد مدفوعات</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground whitespace-nowrap">{p.profiles?.full_name || 'مجهول'}</p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{p.profiles?.phone || p.profiles?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap max-w-[160px]"><span className="truncate block">{p.courses?.title_ar}</span></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{METHOD_LABELS[p.payment_method] || p.payment_method}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">{Number(p.amount).toLocaleString('ar-EG')} ج.م</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{p.transaction_ref || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmt(p.created_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="outline" className={cn('text-xs border', STATUS_CLASS[p.status])}>{STATUS_LABELS[p.status] || p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-foreground hover:bg-accent" onClick={() => openDialog(p, 'view')} title="عرض"><Eye className="w-3.5 h-3.5" /></Button>
                        {p.status === 'pending' && <>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-success hover:bg-success/10" onClick={() => openDialog(p, 'approve')} title="موافقة"><CheckCircle className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:bg-destructive/10" onClick={() => openDialog(p, 'reject')} title="رفض"><XCircle className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-warning hover:bg-warning/10" onClick={() => openDialog(p, 'needs_info')} title="يحتاج معلومات"><AlertTriangle className="w-3.5 h-3.5" /></Button>
                        </>}
                        {p.status === 'approved' && (
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-info hover:bg-info/10" onClick={() => openDialog(p, 'refund')} title="استرداد"><RotateCcw className="w-3.5 h-3.5" /></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={dialogType === 'view'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl bg-card border-border">
          <DialogHeader><DialogTitle className="font-cairo text-foreground">تفاصيل الدفع</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="الطالب" value={selected.profiles?.full_name || 'مجهول'} />
                <InfoRow label="البريد الإلكتروني" value={selected.profiles?.email || '—'} />
                <InfoRow label="الهاتف" value={selected.profiles?.phone || '—'} />
                <InfoRow label="الكورس" value={selected.courses?.title_ar || '—'} />
                <InfoRow label="المبلغ المدفوع" value={`${Number(selected.amount).toLocaleString('ar-EG')} ج.م`} />
                <InfoRow label="طريقة الدفع" value={METHOD_LABELS[selected.payment_method] || selected.payment_method} />
                <InfoRow label="رقم المعاملة" value={selected.transaction_ref || '—'} />
                <InfoRow label="تاريخ الدفع" value={fmt(selected.created_at)} />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">الحالة:</p>
                <Badge variant="outline" className={cn('text-xs border', STATUS_CLASS[selected.status])}>{STATUS_LABELS[selected.status]}</Badge>
              </div>
              {selected.receipt_url && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">إثبات الدفع</p>
                  <a href={selected.receipt_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary text-xs hover:underline">
                    عرض الإيصال <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {selected.admin_notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ملاحظات المدير</p>
                  <p className="text-sm bg-secondary/50 rounded p-2">{selected.admin_notes}</p>
                </div>
              )}
              {selected.needs_info_reason && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">المعلومات المطلوبة</p>
                  <p className="text-sm bg-warning/10 text-warning rounded p-2">{selected.needs_info_reason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} className="border border-border text-foreground">إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={dialogType === 'approve'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border">
          <DialogHeader><DialogTitle className="font-cairo text-success flex items-center gap-2"><CheckCircle className="w-5 h-5" />الموافقة على الدفع</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">سيتم قبول هذا الدفع. يمكنك بعدها الموافقة على الاشتراك.</p>
            <Textarea placeholder="ملاحظات (اختياري)..." value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="bg-input border-border resize-none" rows={3} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={() => updateStatus('approved')} disabled={actionLoading} className="bg-success text-white hover:bg-success/90">{actionLoading ? 'جاري...' : 'تأكيد الموافقة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={dialogType === 'reject'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border">
          <DialogHeader><DialogTitle className="font-cairo text-destructive flex items-center gap-2"><XCircle className="w-5 h-5" />رفض الدفع</DialogTitle></DialogHeader>
          <Textarea placeholder="سبب الرفض..." value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="bg-input border-border resize-none" rows={4} />
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={() => updateStatus('rejected')} disabled={actionLoading} className="bg-destructive text-white hover:bg-destructive/90">{actionLoading ? 'جاري...' : 'تأكيد الرفض'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Needs Info Dialog */}
      <Dialog open={dialogType === 'needs_info'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border">
          <DialogHeader><DialogTitle className="font-cairo text-warning flex items-center gap-2"><AlertTriangle className="w-5 h-5" />طلب معلومات إضافية</DialogTitle></DialogHeader>
          <Textarea placeholder="ما المعلومات المطلوبة من الطالب؟..." value={needsInfoReason} onChange={e => setNeedsInfoReason(e.target.value)} className="bg-input border-border resize-none" rows={4} />
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={() => updateStatus('needs_info', { needs_info_reason: needsInfoReason })} disabled={actionLoading} className="bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20">{actionLoading ? 'جاري...' : 'إرسال الطلب'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={dialogType === 'refund'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border">
          <DialogHeader><DialogTitle className="font-cairo text-info flex items-center gap-2"><RotateCcw className="w-5 h-5" />تسجيل استرداد</DialogTitle></DialogHeader>
          <Textarea placeholder="ملاحظات الاسترداد..." value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="bg-input border-border resize-none" rows={3} />
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={() => updateStatus('refunded')} disabled={actionLoading} className="bg-info/10 text-info border border-info/20 hover:bg-info/20">{actionLoading ? 'جاري...' : 'تأكيد الاسترداد'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AdminLayout>
  );
}
function InfoRow({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm text-foreground font-medium">{value}</p></div>;
}
