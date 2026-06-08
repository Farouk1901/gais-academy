import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Plus, Search, Edit, Trash2, RefreshCw, Video, ShieldAlert, Droplets } from 'lucide-react';
import type { VideoLesson } from '@/types/types';
import AdminLayout from '@/components/layouts/AdminLayout';

type VideoRow = VideoLesson & { title_ar?: string; is_protected?: boolean; disable_download?: boolean; is_published?: boolean; lessons?: { title_ar: string; courses?: { title_ar: string } } };
const emptyForm = { lesson_id: '', title_ar: '', video_type: 'external' as 'upload' | 'external' | 'hls', video_url: '', duration_seconds: 0, is_protected: true, watermark_enabled: false, watermark_text: '', disable_download: true, is_published: true };

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [lessons, setLessons] = useState<{ id: string; title_ar: string; course_title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<VideoRow | null>(null);
  const [dialogType, setDialogType] = useState<'edit' | 'create' | 'delete' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
    const [{ data: vids }, { data: lessonsData }] = await Promise.all([
      supabase.from('videos').select('*, lessons!lesson_id(title_ar, courses!course_id(title_ar))').order('created_at', { ascending: false }),
      supabase.from('lessons').select('id, title_ar, courses!course_id(title_ar)').order('title_ar'),
    ]);
    setVideos((vids || []) as VideoRow[]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setLessons((lessonsData || []).map((l: any) => ({
      id: l.id, title_ar: l.title_ar,
      course_title: (Array.isArray(l.courses) ? l.courses[0]?.title_ar : l.courses?.title_ar) || '',
    })));
    } catch (err) {
      console.error('AdminVideosPage.tsx fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = videos.filter(v => !search || v.title_ar?.toLowerCase().includes(search.toLowerCase()) || (v.lessons as { title_ar: string } | undefined)?.title_ar?.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setForm(emptyForm); setSelected(null); setDialogType('create'); };
  const openEdit = (v: VideoRow) => {
    setSelected(v);
    setForm({ lesson_id: v.lesson_id || '', title_ar: v.title_ar || '', video_type: v.video_type || 'external', video_url: '', duration_seconds: v.duration_seconds || 0, is_protected: v.is_protected !== false, watermark_enabled: v.watermark_enabled || false, watermark_text: v.watermark_text || '', disable_download: v.disable_download !== false, is_published: v.is_published !== false });
    setDialogType('edit');
  };

  const saveVideo = async () => {
    if (!form.lesson_id || !form.title_ar) { toast.error('الدرس والعنوان مطلوبان'); return; }
    setActionLoading(true);
    const payload = { lesson_id: form.lesson_id, title_ar: form.title_ar, video_type: form.video_type, duration_seconds: Number(form.duration_seconds) || null, is_protected: form.is_protected, watermark_enabled: form.watermark_enabled, watermark_text: form.watermark_text || null, disable_download: form.disable_download, is_published: form.is_published };
    try {
      if (dialogType === 'create') {
        const { error } = await supabase.from('videos').insert(payload);
        if (error) throw error;
        toast.success('تم إضافة الفيديو');
        setDialogType(null);
        fetchData();
      } else if (selected) {
        const { error } = await supabase.from('videos').update(payload).eq('id', selected.id);
        if (error) throw error;
        toast.success('تم تحديث الفيديو');
        setDialogType(null);
        fetchData();
      }
    } catch (err) {
      console.error('saveVideo error:', err);
      toast.error(dialogType === 'create' ? 'فشل في إضافة الفيديو' : 'فشل في تحديث الفيديو');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteVideo = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('videos').delete().eq('id', selected.id);
      if (error) throw error;
      toast.success('تم حذف الفيديو');
      setDialogType(null);
      fetchData();
    } catch (err) {
      console.error('deleteVideo error:', err);
      toast.error('فشل في حذف الفيديو');
    } finally {
      setActionLoading(false);
    }
  };

  const TYPE_LABELS: Record<string, string> = { upload: 'رفع ملف', external: 'رابط خارجي', hls: 'HLS Streaming' };

  return (
    <AdminLayout>
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold text-foreground font-cairo">إدارة الفيديوهات</h2><p className="text-sm text-muted-foreground">إدارة فيديوهات الكورسات مع حماية المحتوى</p></div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchData} className="border border-border text-foreground hover:bg-accent"><RefreshCw className="w-4 h-4" /></Button>
          <Button size="sm" onClick={openCreate} className="gap-1.5"><Plus className="w-4 h-4" />فيديو جديد</Button>
        </div>
      </div>
      {/* Protection notice */}
      <Card className="stat-card border-primary/20">
        <CardContent className="p-3 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">جميع الفيديوهات محمية. لا تُكشف الروابط الأصلية للمتصفح. يُنصح بتفعيل العلامة المائية لحماية المحتوى.</p>
        </CardContent>
      </Card>
      <Card className="stat-card"><CardContent className="p-4">
        <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="ابحث..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9 bg-input border-border" /></div>
      </CardContent></Card>
      <Card className="stat-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold font-cairo">الفيديوهات ({loading ? '...' : filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="w-full max-w-full overflow-x-auto bg-card rounded-b-lg">
            <table className="w-full min-w-max">
              <thead><tr className="border-b border-border">{['عنوان الفيديو', 'الدرس', 'النوع', 'المدة', 'محمي', 'علامة مائية', 'الحالة', 'إجراءات'].map(h => <th key={h} className="text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {loading ? [...Array(4)].map((_, i) => <tr key={i} className="border-b border-border/50">{[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20 bg-muted" /></td>)}</tr>) :
                filtered.length === 0 ? <tr><td colSpan={8} className="text-center text-sm text-muted-foreground py-12">لا توجد فيديوهات</td></tr> :
                filtered.map(v => {
                  const lesson = v.lessons as { title_ar: string } | undefined;
                  return (
                    <tr key={v.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap max-w-[180px]"><div className="flex items-center gap-2"><Video className="w-3.5 h-3.5 text-primary shrink-0" /><span className="truncate">{v.title_ar || '—'}</span></div></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{lesson?.title_ar || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><Badge variant="outline" className="text-xs border border-border text-muted-foreground">{TYPE_LABELS[v.video_type] || v.video_type}</Badge></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{v.duration_seconds ? `${Math.floor(v.duration_seconds / 60)} د` : '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><Badge variant="outline" className={cn('text-xs border', v.is_protected ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border')}>{v.is_protected ? '✓' : '✗'}</Badge></td>
                      <td className="px-4 py-3 whitespace-nowrap"><div className={cn('flex items-center gap-1 text-xs', v.watermark_enabled ? 'text-info' : 'text-muted-foreground')}><Droplets className="w-3 h-3" />{v.watermark_enabled ? 'مفعّل' : 'معطّل'}</div></td>
                      <td className="px-4 py-3 whitespace-nowrap"><Badge variant="outline" className={cn('text-xs border', v.is_published ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border')}>{v.is_published ? 'منشور' : 'مخفي'}</Badge></td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-foreground hover:bg-accent" onClick={() => openEdit(v)}><Edit className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:bg-destructive/10" onClick={() => { setSelected(v); setDialogType('delete'); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogType === 'edit' || dialogType === 'create'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-border max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-cairo text-foreground">{dialogType === 'create' ? 'إضافة فيديو' : 'تعديل الفيديو'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">الدرس *</Label>
              <Select value={form.lesson_id} onValueChange={v => setForm(p => ({ ...p, lesson_id: v }))}>
                <SelectTrigger className="bg-input border-border"><SelectValue placeholder="اختر الدرس..." /></SelectTrigger>
                <SelectContent>{lessons.map(l => <SelectItem key={l.id} value={l.id}>{l.title_ar} — {l.course_title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">عنوان الفيديو *</Label><Input value={form.title_ar} onChange={e => setForm(p => ({ ...p, title_ar: e.target.value }))} className="bg-input border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">نوع الفيديو</Label>
                <Select value={form.video_type} onValueChange={v => setForm(p => ({ ...p, video_type: v as 'upload' | 'external' | 'hls' }))}>
                  <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="external">رابط خارجي</SelectItem><SelectItem value="upload">رفع ملف</SelectItem><SelectItem value="hls">HLS</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">المدة (ثواني)</Label><Input type="number" value={form.duration_seconds} onChange={e => setForm(p => ({ ...p, duration_seconds: Number(e.target.value) }))} className="bg-input border-border" /></div>
            </div>
            <p className="text-xs text-warning bg-warning/5 border border-warning/20 rounded p-2">⚠️ الروابط تُخزن في الخادم فقط ولا تُكشف للمستخدمين مباشرة.</p>
            <div className="space-y-2">
              {[
                { key: 'is_protected', label: 'تفعيل الحماية', desc: 'يمنع الوصول المباشر للرابط' },
                { key: 'watermark_enabled', label: 'العلامة المائية', desc: 'تضاف على الفيديو أثناء التشغيل' },
                { key: 'disable_download', label: 'منع التحميل', desc: 'يخفي زر التحميل' },
                { key: 'is_published', label: 'منشور', desc: 'مرئي للطلاب المشتركين' },
              ].map(opt => (
                <div key={opt.key} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                  <div><p className="text-sm text-foreground">{opt.label}</p><p className="text-xs text-muted-foreground">{opt.desc}</p></div>
                  <Switch checked={!!form[opt.key as keyof typeof form]} onCheckedChange={v => setForm(p => ({ ...p, [opt.key]: v }))} />
                </div>
              ))}
            </div>
            {form.watermark_enabled && (
              <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">نص العلامة المائية</Label>
                <Input value={form.watermark_text} onChange={e => setForm(p => ({ ...p, watermark_text: e.target.value }))} placeholder="مثال: {student_name} | {phone}" className="bg-input border-border" />
                <p className="text-xs text-muted-foreground">المتغيرات: {'{student_name}'} {'{phone}'} {'{email}'}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogType(null)} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={saveVideo} disabled={actionLoading}>{actionLoading ? 'جاري...' : dialogType === 'create' ? 'إضافة' : 'حفظ'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogType === 'delete'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm bg-card border-border">
          <DialogHeader><DialogTitle className="font-cairo text-destructive">حذف الفيديو</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">هل تريد حذف هذا الفيديو؟</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogType(null)} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={deleteVideo} disabled={actionLoading} className="bg-destructive text-white">{actionLoading ? 'جاري...' : 'حذف'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AdminLayout>
  );
}
