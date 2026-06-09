import { useEffect, useState } from 'react';
import { supabase } from '@/db/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, RefreshCw, Activity } from 'lucide-react';
import type { AdminActivityLog } from '@/types/types';
import AdminLayout from '@/components/layouts/AdminLayout';

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  approve_subscription: { label: 'موافقة اشتراك', color: 'bg-success/10 text-success border-success/20' },
  reject_subscription: { label: 'رفض اشتراك', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  payment_approved: { label: 'موافقة دفع', color: 'bg-success/10 text-success border-success/20' },
  payment_rejected: { label: 'رفض دفع', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  payment_needs_info: { label: 'طلب معلومات', color: 'bg-warning/10 text-warning border-warning/20' },
  payment_refunded: { label: 'استرداد دفع', color: 'bg-info/10 text-info border-info/20' },
  create_course: { label: 'إنشاء كورس', color: 'bg-primary/10 text-primary border-primary/20' },
  edit_course: { label: 'تعديل كورس', color: 'bg-muted text-muted-foreground border-border' },
  delete_course: { label: 'حذف كورس', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  published_course: { label: 'نشر كورس', color: 'bg-success/10 text-success border-success/20' },
  unpublished_course: { label: 'إلغاء نشر', color: 'bg-warning/10 text-warning border-warning/20' },
  edit_user: { label: 'تعديل مستخدم', color: 'bg-muted text-muted-foreground border-border' },
  deactivate_user: { label: 'تعطيل حساب', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

type LogRow = AdminActivityLog & { profiles?: { full_name: string | null } };

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
    const { data, error } = await supabase.from('admin_activity_logs')
      .select('*, profiles!admin_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!error) setLogs((data || []) as LogRow[]);
    } catch (err) {
      console.error('AdminActivityLogsPage.tsx fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = (l.profiles as { full_name: string | null } | undefined)?.full_name || '';
    return name.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || (l.entity_type || '').toLowerCase().includes(q);
  });

  const fmt = (d: string) => new Date(d).toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <AdminLayout>
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-foreground font-cairo">سجلات النشاط</h2><p className="text-sm text-muted-foreground">تتبع إجراءات المدراء على المنصة</p></div>
        <Button variant="ghost" size="sm" onClick={fetchLogs} className="border border-border text-foreground hover:bg-accent"><RefreshCw className="w-4 h-4" /></Button>
      </div>
      <Card className="stat-card"><CardContent className="p-4">
        <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="ابحث بالاسم أو الإجراء..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9 bg-input border-border" /></div>
      </CardContent></Card>
      <Card className="stat-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold font-cairo">السجلات ({loading ? '...' : filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="w-full max-w-full overflow-x-auto bg-card rounded-b-lg">
            <table className="w-full min-w-max">
              <thead><tr className="border-b border-border">{['المدير', 'الإجراء', 'النوع', 'المعرف', 'التاريخ'].map(h => <th key={h} className="text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {loading ? [...Array(6)].map((_, i) => <tr key={i} className="border-b border-border/50">{[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24 bg-muted" /></td>)}</tr>) :
                filtered.length === 0 ? <tr><td colSpan={5} className="text-center text-sm text-muted-foreground py-12">لا توجد سجلات</td></tr> :
                filtered.map(log => {
                  const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: 'bg-muted text-muted-foreground border-border' };
                  return (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Activity className="w-3 h-3 text-primary" /></div>
                          <span className="text-sm text-foreground whitespace-nowrap">{(log.profiles as { full_name: string | null } | undefined)?.full_name || 'مجهول'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap"><Badge variant="outline" className={`text-xs border ${actionInfo.color}`}>{actionInfo.label}</Badge></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{log.entity_type || '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap font-mono">{log.entity_id ? log.entity_id.slice(0, 8) + '...' : '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmt(log.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  );
}



