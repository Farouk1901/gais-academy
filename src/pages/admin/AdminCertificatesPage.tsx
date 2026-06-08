import { useEffect, useState } from 'react';
import { Award, Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/db/supabase';

interface CertRow {
  id: string;
  certificate_number: string;
  issued_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
  courses: { title_ar: string } | null;
}

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
      let q = supabase
        .from('certificates')
        .select('id, certificate_number, issued_at, profiles!student_id(full_name, email), courses!course_id(title_ar)')
        .order('issued_at', { ascending: false });
      if (search.trim()) {
        q = q.ilike('certificate_number', `%${search.trim()}%`);
      }
      const { data } = await q;
      setCerts(Array.isArray(data) ? (data as unknown as CertRow[]) : []);
      } catch (err) {
        console.error('AdminCertificatesPage.tsx fetch error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground font-heading">إدارة الشهادات</h1>
        <p className="text-muted-foreground text-sm mt-1">{certs.length} شهادة</p>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute top-1/2 end-3 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="بحث برقم الشهادة..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pe-10 bg-card border-border"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">رقم الشهادة</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الطالب</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الكورس</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">تاريخ الإصدار</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-8 bg-muted rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : certs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-14">
                    <Award className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">لا توجد شهادات بعد</p>
                  </td>
                </tr>
              ) : (
                certs.map((c, i) => (
                  <tr key={c.id} className={`text-sm ${i > 0 ? 'border-t border-border' : ''}`}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-warning/10 flex items-center justify-center shrink-0">
                          <Award className="h-3 w-3 text-warning" />
                        </div>
                        <span className="font-mono text-foreground text-xs font-medium ltr-number">
                          {c.certificate_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-foreground text-xs font-medium">{c.profiles?.full_name || '—'}</p>
                      <p className="text-muted-foreground text-xs">{c.profiles?.email || '—'}</p>
                    </td>
                    <td className="px-4 py-3 max-w-40 whitespace-nowrap">
                      <p className="text-foreground text-xs truncate">{c.courses?.title_ar || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs ltr-number whitespace-nowrap">
                      {new Date(c.issued_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="outline" className="text-xs text-success bg-success/10 border-success/30">
                        صالحة
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        {!loading && certs.length > 0 && (
          <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              إجمالي الشهادات المُصدرة: <span className="text-foreground font-medium ltr-number">{certs.length}</span>
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="h-3 w-3" />
              التصدير قريباً
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
