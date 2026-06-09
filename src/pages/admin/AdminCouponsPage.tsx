import { useEffect, useState, FormEvent } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import type { Coupon } from '@/types/types';

const emptyForm: {
  code: string; coupon_type: 'percentage' | 'fixed';
  discount_value: number; usage_limit: number; expires_at: string;
} = {
  code: '', coupon_type: 'percentage',
  discount_value: 10, usage_limit: 100,
  expires_at: '',
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('fetchCoupons error:', error.message);
      setCoupons(Array.isArray(data) ? (data as Coupon[]) : []);
    } catch (err) {
      console.error('AdminCouponsPage error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.code) { toast.error('كود الكوبون مطلوب'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('coupons').insert({
        code: form.code.toUpperCase(),
        coupon_type: form.coupon_type,
        discount_value: Number(form.discount_value),
        usage_limit: Number(form.usage_limit),
        expires_at: form.expires_at || null,
        is_active: true,
        usage_count: 0,
      });
      if (error) throw error;
      toast.success('تم إنشاء الكوبون');
      setForm(emptyForm);
      setOpen(false);
      fetchCoupons();
    } catch (err: unknown) {
      const pgErr = err as { code?: string };
      toast.error(pgErr?.code === '23505' ? 'هذا الكود موجود بالفعل' : 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      toast.success('تم حذف الكوبون');
      fetchCoupons();
    } catch (err) {
      console.error('deleteCoupon error:', err);
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const { error } = await supabase.from('coupons').update({ is_active: !coupon.is_active }).eq('id', coupon.id);
      if (error) throw error;
      fetchCoupons();
    } catch (err) {
      console.error('toggleActive coupon error:', err);
      toast.error('حدث خطأ أثناء تغيير حالة الكوبون');
    }
  };

  const isExpired = (c: Coupon) => c.expires_at ? new Date(c.expires_at) < new Date() : false;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">إدارة الكوبونات</h1>
          <p className="text-muted-foreground text-sm mt-1">{coupons.length} كوبون</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              إضافة كوبون
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
            <DialogHeader>
              <DialogTitle>إنشاء كوبون جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-normal">كود الكوبون *</Label>
                <Input
                  placeholder="GAIS20"
                  value={form.code}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="bg-background border-border font-mono"
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal">نوع الخصم</Label>
                  <Select value={form.coupon_type} onValueChange={v => setForm(p => ({ ...p, coupon_type: v as 'percentage' | 'fixed' }))}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">نسبة مئوية %</SelectItem>
                      <SelectItem value="fixed">مبلغ ثابت ج.م</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal">
                    قيمة الخصم ({form.coupon_type === 'percentage' ? '%' : 'ج.م'})
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max={form.coupon_type === 'percentage' ? '100' : undefined}
                    value={form.discount_value}
                    onChange={e => setForm(p => ({ ...p, discount_value: Number(e.target.value) }))}
                    className="bg-background border-border"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal">الحد الأقصى للاستخدام</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.usage_limit}
                    onChange={e => setForm(p => ({ ...p, usage_limit: Number(e.target.value) }))}
                    className="bg-background border-border"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal">تاريخ الانتهاء</Label>
                  <Input
                    type="date"
                    value={form.expires_at}
                    onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                    className="bg-background border-border"
                    dir="ltr"
                  />
                </div>
              </div>
              <Button type="submit" disabled={saving} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? 'جاري الحفظ...' : 'إنشاء الكوبون'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الكود</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الخصم</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الاستخدام</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">انتهاء الصلاحية</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الحالة</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-8 bg-muted rounded animate-pulse" /></td></tr>
                ))
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">لا توجد كوبونات</p>
                  </td>
                </tr>
              ) : coupons.map((c, i) => {
                const expired = isExpired(c);
                return (
                  <tr key={c.id} className={`text-sm ${i > 0 ? 'border-t border-border' : ''}`}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-foreground text-xs font-medium">{c.code}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground text-xs whitespace-nowrap ltr-number">
                      {c.discount_value}{c.coupon_type === 'percentage' ? '%' : ' ج.م'}
                    </td>
                    <td className="px-4 py-3 text-foreground text-xs ltr-number whitespace-nowrap">
                      {c.usage_count} / {c.usage_limit}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs ltr-number whitespace-nowrap">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString('ar-EG') : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="outline" className={`text-xs ${
                        expired ? 'text-muted-foreground bg-muted border-border' :
                        !c.is_active ? 'text-destructive bg-destructive/10 border-destructive/30' :
                        'text-success bg-success/10 border-success/30'
                      }`}>
                        {expired ? 'منتهي' : c.is_active ? 'نشط' : 'موقوف'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleActive(c)}>
                          {c.is_active ? 'إيقاف' : 'تفعيل'}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف الكوبون</AlertDialogTitle>
                              <AlertDialogDescription>هل أنت متأكد من حذف كوبون "{c.code}"؟</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteCoupon(c.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}



