import { useEffect, useState } from 'react';
import { supabase } from '@/db/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Save, RefreshCw } from 'lucide-react';
import type { PlatformSetting } from '@/types/types';
import AdminLayout from '@/components/layouts/AdminLayout';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const fetchSettings = async () => {
    setLoading(true);
    try {
    const { data } = await supabase.from('platform_settings').select('*').order('group_name').order('label_ar');
    setSettings(data || []);
    const v: Record<string, string> = {};
    (data || []).forEach((s: PlatformSetting) => { v[s.key] = s.value || ''; });
    setValues(v);
    } catch (err) {
      console.error('AdminSettingsPage.tsx fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const saveAll = async () => {
    setSaving(true);
    let hasError = false;
    for (const key of Object.keys(values)) {
      const { error } = await supabase.from('platform_settings').update({ value: values[key] || null, updated_at: new Date().toISOString() }).eq('key', key);
      if (error) { hasError = true; break; }
    }
    if (hasError) toast.error('فشل في حفظ بعض الإعدادات');
    else toast.success('تم حفظ جميع الإعدادات');
    setSaving(false);
  };

  const grouped = settings.reduce((acc, s) => {
    const g = s.group_name || 'عام';
    if (!acc[g]) acc[g] = [];
    acc[g].push(s);
    return acc;
  }, {} as Record<string, PlatformSetting[]>);

  return (
    <AdminLayout>
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-foreground font-cairo">إعدادات المنصة</h2><p className="text-sm text-muted-foreground">تخصيص المنصة وإعدادات الدفع</p></div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchSettings} className="border border-border text-foreground hover:bg-accent"><RefreshCw className="w-4 h-4" /></Button>
          <Button onClick={saveAll} disabled={saving} className="gap-1.5"><Save className="w-4 h-4" />{saving ? 'جاري الحفظ...' : 'حفظ الكل'}</Button>
        </div>
      </div>
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full bg-muted" />)}</div>
      ) : (
        Object.entries(grouped).map(([group, groupSettings]) => (
          <Card key={group} className="stat-card">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold font-cairo text-foreground">{group}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {groupSettings.map(s => (
                <div key={s.key} className="space-y-1.5">
                  <Label className="text-sm font-normal text-muted-foreground">{s.label_ar}</Label>
                  <Input value={values[s.key] ?? ''} onChange={e => setValues(p => ({ ...p, [s.key]: e.target.value }))} className="bg-input border-border" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
    </AdminLayout>
  );
}
