import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Plus, Search, Edit, Trash2, RefreshCw, Eye, EyeOff, GripVertical } from 'lucide-react';
import type { Lesson } from '@/types/types';
import AdminLayout from '@/components/layouts/AdminLayout';

type LessonWithCourse = Lesson & { courses?: { title_ar: string } };
const emptyForm = { title_ar: '', title_en: '', description_ar: '', course_id: '', order_number: 1, is_free_preview: false, is_published: true, duration_minutes: 0, video_url: '', attachment_url: '' };

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<LessonWithCourse[]>([]);
  const [courses, setCourses] = useState<{ id: string; title_ar: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selected, setSelected] = useState<LessonWithCourse | null>(null);
  const [dialogType, setDialogType] = useState<'edit' | 'create' | 'delete' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
    const [{ data: lessonsData, error }, { data: coursesData }] = await Promise.all([
      supabase.from('lessons').select('*, courses!course_id(title_ar)').order('course_id').order('order_index'),
      supabase.from('courses').select('id, title_ar').order('title_ar'),
    ]);
    if (error) toast.error('خطأ في تحميل الدروس');
    else setLessons((lessonsData || []) as LessonWithCourse[]);
    setCourses(coursesData || []);
    } catch (err) {
      console.error('AdminLessonsPage.tsx fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = lessons.filter(l => {
    if (courseFilter !== 'all' && l.course_id !== courseFilter) return false;
    if (!search) return true;
    return l.title_ar?.toLowerCase().includes(search.toLowerCase());
  });

  const openCreate = () => { setForm({ ...emptyForm, course_id: courseFilter !== 'all' ? courseFilter : '' }); setSelected(null); setDialogType('create'); };
  const openEdit = (l: LessonWithCourse) => {
    setSelected(l);
    setForm({ title_ar: l.title_ar || '', title_en: l.title_en || '', description_ar: l.description_ar || '', course_id: l.course_id, order_number: l.order_number || 1, is_free_preview: l.is_free_preview || false, is_published: l.is_published !== false, duration_minutes: l.duration_minutes || 0, video_url: '', attachment_url: '' });
    setDialogType('edit');
  };

  const saveLesson = async () => {
    if (!form.title_ar.trim() || !form.course_id) { toast.error('العنوان والكورس مطلوبان'); return; }
    setActionLoading(true);
    const payload = { title: form.title_ar, title_ar: form.title_ar, description: form.description_ar || null, description_ar: form.description_ar || null, course_id: form.course_id, order_number: Number(form.order_number), order_index: Number(form.order_number), is_free_preview: form.is_free_preview, is_preview: form.is_free_preview, is_published: form.is_published, duration_minutes: Number(form.duration_minutes) || null };
    try {
      if (dialogType === 'create') {
        const { data: inserted, error } = await supabase.from('lessons').insert(payload).select('id').single();
        if (error) throw error;
        // Auto-create video record if URL was provided
        if (form.video_url.trim() && inserted?.id) {
          await supabase.from('videos').insert({
            lesson_id: inserted.id,
            title: form.title_ar,
            title_ar: form.title_ar,
            video_type: 'external',
            video_url: form.video_url.trim(),
            is_published: true,
            is_protected: false,
            disable_download: true,
          });
        }
        toast.success('تم إنشاء الدرس');
        setDialogType(null);
        fetchData();
      } else if (selected) {
        const { error } = await supabase.from('lessons').update(payload).eq('id', selected.id);
        if (error) throw error;
        // Update or create video record if URL was provided
        if (form.video_url.trim()) {
          const { data: existingVideo } = await supabase.from('videos').select('id').eq('lesson_id', selected.id).maybeSingle();
          if (existingVideo) {
            await supabase.from('videos').update({ video_url: form.video_url.trim() }).eq('id', existingVideo.id);
          } else {
            await supabase.from('videos').insert({
              lesson_id: selected.id, title: form.title_ar, title_ar: form.title_ar,
              video_type: 'external', video_url: form.video_url.trim(),
              is_published: true, is_protected: false, disable_download: true,
            });
          }
        }
        toast.success('تم تحديث الدرس');
        setDialogType(null);
        fetchData();
      }
    } catch (err) {
      console.error('saveLesson error:', err);
      toast.error(dialogType === 'create' ? 'فشل في إنشاء الدرس' : 'فشل في تحديث الدرس');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteLesson = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', selected.id);
      if (error) throw error;
      toast.success('تم حذف الدرس');
      setDialogType(null);
      fetchData();
    } catch (err) {
      console.error('deleteLesson error:', err);
      toast.error('فشل في حذف الدرس');
    } finally {
      setActionLoading(false);
    }
  };

  const togglePublish = async (l: LessonWithCourse) => {
    try {
      const { error } = await supabase.from('lessons').update({ is_published: !l.is_published }).eq('id', l.id);
      if (error) throw error;
      toast.success(l.is_published ? 'تم إخفاء الدرس' : 'تم نشر الدرس');
      fetchData();
    } catch (err) {
      console.error('togglePublish lesson error:', err);
      toast.error('فشل في تغيير حالة الدرس');
    }
  };

  return (
    <AdminLayout>
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold text-foreground font-cairo">إدارة الدروس</h2><p className="text-sm text-muted-foreground">إنشاء وإدارة دروس الكورسات</p></div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={fetchData} className="border border-border text-foreground hover:bg-accent"><RefreshCw className="w-4 h-4" /></Button>
          <Button size="sm" onClick={openCreate} className="gap-1.5"><Plus className="w-4 h-4" />درس جديد</Button>
        </div>
      </div>
      <Card className="stat-card"><CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="ابحث..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9 bg-input border-border" /></div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full md:w-56 bg-input border-border"><SelectValue placeholder="الكورس" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الكورسات</SelectItem>
              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title_ar}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>
      <Card className="stat-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold font-cairo">الدروس ({loading ? '...' : filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="w-full max-w-full overflow-x-auto bg-card rounded-b-lg">
            <table className="w-full min-w-max">
              <thead><tr className="border-b border-border">{['', 'عنوان الدرس', 'الكورس', 'الترتيب', 'المدة', 'معاينة مجانية', 'الحالة', 'إجراءات'].map(h => <th key={h} className="text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {loading ? [...Array(5)].map((_, i) => <tr key={i} className="border-b border-border/50">{[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20 bg-muted" /></td>)}</tr>) :
                filtered.length === 0 ? <tr><td colSpan={8} className="text-center text-sm text-muted-foreground py-12">لا توجد دروس</td></tr> :
                filtered.map(l => (
                  <tr key={l.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground"><GripVertical className="w-4 h-4" /></td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap max-w-[200px]"><span className="truncate block">{l.title_ar}</span></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{(l.courses as { title_ar: string } | undefined)?.title_ar || '—'}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap text-center">{l.order_number}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{l.duration_minutes ? `${l.duration_minutes} د` : '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><Badge variant="outline" className={cn('text-xs border', l.is_free_preview ? 'bg-info/10 text-info border-info/20' : 'bg-muted text-muted-foreground border-border')}>{l.is_free_preview ? 'مجاني' : 'مدفوع'}</Badge></td>
                    <td className="px-4 py-3 whitespace-nowrap"><Badge variant="outline" className={cn('text-xs border', l.is_published ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border')}>{l.is_published ? 'منشور' : 'مخفي'}</Badge></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-foreground hover:bg-accent" onClick={() => openEdit(l)}><Edit className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className={cn('w-7 h-7', l.is_published ? 'text-warning hover:bg-warning/10' : 'text-success hover:bg-success/10')} onClick={() => togglePublish(l)}>
                          {l.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:bg-destructive/10" onClick={() => { setSelected(l); setDialogType('delete'); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogType === 'edit' || dialogType === 'create'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-border max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-cairo text-foreground">{dialogType === 'create' ? 'درس جديد' : 'تعديل الدرس'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">الكورس *</Label>
              <Select value={form.course_id} onValueChange={v => setForm(p => ({ ...p, course_id: v }))}>
                <SelectTrigger className="bg-input border-border"><SelectValue placeholder="اختر الكورس..." /></SelectTrigger>
                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title_ar}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">عنوان الدرس *</Label><Input value={form.title_ar} onChange={e => setForm(p => ({ ...p, title_ar: e.target.value }))} className="bg-input border-border" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">الوصف</Label><Textarea value={form.description_ar} onChange={e => setForm(p => ({ ...p, description_ar: e.target.value }))} className="bg-input border-border resize-none" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">رقم الترتيب</Label><Input type="number" value={form.order_number} onChange={e => setForm(p => ({ ...p, order_number: Number(e.target.value) }))} className="bg-input border-border" /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">المدة (دقائق)</Label><Input type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))} className="bg-input border-border" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">رابط الفيديو (اختياري)</Label><Input value={form.video_url} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))} placeholder="https://..." className="bg-input border-border" /></div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"><span className="text-sm text-foreground">معاينة مجانية</span><Switch checked={form.is_free_preview} onCheckedChange={v => setForm(p => ({ ...p, is_free_preview: v }))} /></div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"><span className="text-sm text-foreground">منشور</span><Switch checked={form.is_published} onCheckedChange={v => setForm(p => ({ ...p, is_published: v }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogType(null)} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={saveLesson} disabled={actionLoading}>{actionLoading ? 'جاري...' : dialogType === 'create' ? 'إنشاء' : 'حفظ'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogType === 'delete'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm bg-card border-border">
          <DialogHeader><DialogTitle className="font-cairo text-destructive">حذف الدرس</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">هل تريد حذف درس "{selected?.title_ar}"؟</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogType(null)} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={deleteLesson} disabled={actionLoading} className="bg-destructive text-white">{actionLoading ? 'جاري...' : 'حذف'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AdminLayout>
  );
}
