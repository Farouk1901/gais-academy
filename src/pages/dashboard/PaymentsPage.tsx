import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import type { Payment } from '@/types/types';

const methodLabels: Record<string, string> = {
  vodafone_cash: 'Vodafone Cash',
  instapay: 'InstaPay',
  bank_transfer: 'تحويل بنكي',
  paymob: 'Paymob',
  fawry: 'Fawry',
  stripe: 'Stripe',
  manual: 'يدوي',
};

const statusConfig: Record<string, { label: string; class: string }> = {
  approved: { label: 'مقبول', class: 'text-success bg-success/10 border-success/30' },
  pending: { label: 'معلق', class: 'text-warning bg-warning/10 border-warning/30' },
  rejected: { label: 'مرفوض', class: 'text-destructive bg-destructive/10 border-destructive/30' },
  refunded: { label: 'مسترد', class: 'text-muted-foreground bg-muted border-border' },
};

export default function PaymentsPage() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*, courses(title_ar)')
          .eq('student_id', profile.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPayments(Array.isArray(data) ? (data as Payment[]) : []);
      } catch (err) {
        console.error('PaymentsPage fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [profile?.id]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">سجل المدفوعات</h1>
        <p className="text-muted-foreground text-sm mt-1">جميع معاملاتك المالية</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground font-semibold mb-2">لا توجد مدفوعات</h3>
          <p className="text-muted-foreground text-sm">ستظهر هنا مدفوعاتك بعد الاشتراك في كورس</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الكورس</th>
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">المبلغ</th>
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">طريقة الدفع</th>
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">التاريخ</th>
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => {
                  const course = p.courses as unknown as { title_ar: string };
                  const sc = statusConfig[p.status] || { label: p.status, class: '' };
                  return (
                    <tr key={p.id} className={`text-sm ${i > 0 ? 'border-t border-border' : ''}`}>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{course?.title_ar || '—'}</td>
                      <td className="px-4 py-3 text-foreground font-medium ltr-number whitespace-nowrap">{p.amount} ج.م</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{methodLabels[p.payment_method] || p.payment_method}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs ltr-number whitespace-nowrap">
                        {new Date(p.created_at).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="outline" className={`text-xs ${sc.class}`}>
                          {sc.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

