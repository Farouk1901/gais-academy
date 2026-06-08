import { useEffect, useState } from 'react';
import { Award, Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import type { Certificate } from '@/types/types';

export default function CertificatesPage() {
  const { profile } = useAuth();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*, courses(title_ar, instructor_name, thumbnail_url)')
          .eq('student_id', profile.id)
          .order('issued_at', { ascending: false });
        if (error) throw error;
        setCerts(Array.isArray(data) ? (data as Certificate[]) : []);
      } catch (err) {
        console.error('CertificatesPage fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [profile?.id]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">شهاداتي</h1>
        <p className="text-muted-foreground text-sm mt-1">شهادات إتمام الكورسات</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : certs.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground font-semibold mb-2">لا توجد شهادات بعد</h3>
          <p className="text-muted-foreground text-sm">
            أتمم أي كورس للحصول على شهادة إتمام معتمدة
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map(cert => {
            const course = cert.courses as unknown as { title_ar: string; instructor_name: string | null; thumbnail_url: string | null };
            return (
              <div key={cert.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Certificate Preview Header */}
                <div className="bg-gradient-to-l from-primary/20 to-primary/5 border-b border-border p-6 text-center">
                  <Award className="h-10 w-10 text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground text-xs mb-1">شهادة إتمام</p>
                  <h3 className="text-foreground font-bold text-base">
                    {course?.title_ar || 'كورس'}
                  </h3>
                </div>
                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">الطالب</span>
                    <span className="text-foreground font-medium">{profile?.full_name || 'الطالب'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">تاريخ الإصدار</span>
                    <span className="text-foreground ltr-number text-xs">
                      {new Date(cert.issued_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">رقم الشهادة</span>
                    <span className="text-foreground text-xs font-mono ltr-number">{cert.certificate_number}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => window.print()}
                    >
                      <Download className="h-3.5 w-3.5 ms-1.5" />
                      تحميل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => navigator.clipboard?.writeText(cert.certificate_number)}
                      title="نسخ رقم الشهادة"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
