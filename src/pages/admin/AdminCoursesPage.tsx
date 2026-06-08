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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, RefreshCw, BookOpen, Users, GraduationCap } from 'lucide-react';
import type { Course, CourseLevel } from '@/types/types';
import AdminLayout from '@/components/layouts/AdminLayout';

const LEVEL_LABELS: Record<string, string> = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };
const STATUS_CLASS: Record<string, string> = {
  published: 'bg-success/10 text-success border-success/20',
  draft: 'bg-muted text-muted-foreground border-border',
  unpublished: 'bg-warning/10 text-warning border-warning/20',
};
const STATUS_LABELS: Record<string, string> = { published: 'منشور', draft: 'مسودة', unpublished: 'غير منشور' };

const emptyForm = { title_ar: '', title_en: '', description_ar: '', description_en: '', level: 'beginner' as CourseLevel, price: 0, discount_price: 0, duration_hours: 0, cover_image_url: '', category: '', requirements: '', outcomes: '', target_audience: '', is_featured: false, is_free: false };

type CourseWithCount = Course & { enrollments?: { count: number }[]; lessons?: { count: number }[] };

export default function AdminCoursesPage() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<CourseWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<CourseWithCount | null>(null);
  const [dialogType, setDialogType] = useState<'edit' | 'create' | 'delete' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
    let query = supabase.from('courses')
      .select('*, enrollments(count), lessons(count)')
      .order('created_at', { ascending: false });
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    const { data, error } = await query;
    if (error) toast.error('خطأ في تحميل الكورسات');
    else setCourses((data || []) as CourseWithCount[]);
    } catch (err) {
      console.error('AdminCoursesPage.tsx fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const filtered = courses.filter(c => !search || c.title_ar?.toLowerCase().includes(search.toLowerCase()) || (c.category || '').toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setForm(emptyForm); setSelected(null); setDialogType('create'); };
  const openEdit = (c: CourseWithCount) => {
    setSelected(c);
    setForm({ title_ar: c.title_ar || '', title_en: c.title_en || '', description_ar: c.description_ar || '', description_en: c.description_en || '', level: c.level || 'beginner', price: c.price || 0, discount_price: c.discount_price || 0, duration_hours: c.duration_hours || 0, cover_image_url: c.cover_image_url || '', category: c.category || '', requirements: (c.requirements as string[])?.join('\n') || '', outcomes: (c.learning_outcomes as string[])?.join('\n') || '', target_audience: (c.target_audience as string[])?.join('\n') || '', is_featured: c.is_featured || false, is_free: c.is_free || false });
    setDialogType('edit');
  };

  const saveCourse = async () => {
    if (!profile) return;
    if (!form.title_ar.trim()) { toast.error('العنوان العربي مطلوب'); return; }
    setActionLoading(true);
    // Only include columns that actually exist in the DB schema
    const payload = {
      title_ar: form.title_ar,
      description_ar: form.description_ar || null,
      level: form.level,
      price: Number(form.price),
      discount_price: Number(form.discount_price) || null,
      duration_hours: Number(form.duration_hours) || null,
      cover_image_url: form.cover_image_url || null,
      category: form.category || null,
      requirements: form.requirements ? form.requirements.split('\n').filter(Boolean) : null,
      learning_outcomes: form.outcomes ? form.outcomes.split('\n').filter(Boolean) : null,
      target_audience: form.target_audience ? form.target_audience.split('\n').filter(Boolean) : null,
      is_featured: form.is_featured,
      is_free: form.is_free,
    };
    try {
      if (dialogType === 'create') {
        const { error } = await supabase.from('courses').insert({ ...payload, status: 'draft', instructor_id: profile.id });
        if (error) throw new Error(error.message);
        try { await logActivity(profile.id, 'create_course', 'course'); } catch (_) { /* non-critical */ }
        toast.success('تم إنشاء الكورس');
        setDialogType(null);
        fetchCourses();
      } else if (selected) {
        const { error } = await supabase.from('courses').update(payload).eq('id', selected.id);
        if (error) throw new Error(error.message);
        try { await logActivity(profile.id, 'edit_course', 'course', selected.id); } catch (_) { /* non-critical */ }
        toast.success('تم تحديث الكورس');
        setDialogType(null);
        fetchCourses();
      }
    } catch (err) {
      console.error('saveCourse error:', err);
      toast.error(dialogType === 'create' ? 'فشل في إنشاء الكورس' : 'فشل في تحديث الكورس');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (c: CourseWithCount) => {
    if (!profile) return;
    const newStatus = c.status === 'published' ? 'unpublished' : 'published';
    try {
      const { error } = await supabase.from('courses').update({ status: newStatus }).eq('id', c.id);
      if (error) throw error;
      try { await logActivity(profile.id, `${newStatus}_course`, 'course', c.id); } catch (_) { /* log non-critical */ }
      toast.success(newStatus === 'published' ? 'تم نشر الكورس' : 'تم إلغاء نشر الكورس');
      fetchCourses();
    } catch (err) {
      console.error('toggleStatus error:', err);
      toast.error('فشل في تغيير حالة الكورس');
    }
  };

  const deleteCourse = async () => {
    if (!selected || !profile) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('courses').delete().eq('id', selected.id);
      if (error) throw new Error(error.message);
      try { await logActivity(profile.id, 'delete_course', 'course', selected.id); } catch (_) { /* non-critical */ }
      toast.success('تم حذف الكورس');
      setDialogType(null);
      fetchCourses();
    } catch (err) {
      console.error('deleteCourse error:', err);
      toast.error('فشل في حذف الكورس');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold text-foreground font-cairo">إدارة الكورسات</h2><p className="text-sm text-muted-foreground">إنشاء وإدارة الكورسات</p></div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={fetchCourses} className="border border-border text-foreground hover:bg-accent"><RefreshCw className="w-4 h-4" /></Button>
          <Button size="sm" onClick={openCreate} className="gap-1.5"><Plus className="w-4 h-4" />كورس جديد</Button>
        </div>
      </div>
      <Card className="stat-card"><CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="ابحث..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9 bg-input border-border" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 bg-input border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="published">منشور</SelectItem>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="unpublished">غير منشور</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>
      <Card className="stat-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold font-cairo">الكورسات ({loading ? '...' : filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="w-full max-w-full overflow-x-auto bg-card rounded-b-lg">
            <table className="w-full min-w-max">
              <thead><tr className="border-b border-border">{['عنوان الكورس', 'المستوى', 'السعر', 'الطلاب', 'الدروس', 'الحالة', 'إجراءات'].map(h => <th key={h} className="text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {loading ? [...Array(5)].map((_, i) => <tr key={i} className="border-b border-border/50">{[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20 bg-muted" /></td>)}</tr>) :
                filtered.length === 0 ? <tr><td colSpan={7} className="text-center text-sm text-muted-foreground py-12">لا توجد كورسات</td></tr> :
                filtered.map(c => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {c.cover_image_url ? <img src={c.cover_image_url} alt="" className="w-10 h-7 object-cover rounded" /> : <div className="w-10 h-7 bg-primary/10 rounded flex items-center justify-center"><BookOpen className="w-4 h-4 text-primary" /></div>}
                        <div>
                          <p className="text-sm font-medium text-foreground whitespace-nowrap max-w-[200px] truncate">{c.title_ar}</p>
                          {c.category && <p className="text-xs text-muted-foreground whitespace-nowrap">{c.category}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{LEVEL_LABELS[c.level] || c.level}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{c.is_free ? 'مجاني' : `${Number(c.price).toLocaleString('ar-EG')} ج.م`}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" />{(c.enrollments as { count: number }[])?.[0]?.count ?? 0}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><GraduationCap className="w-3 h-3" />{(c.lessons as { count: number }[])?.[0]?.count ?? 0}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><Badge variant="outline" className={cn('text-xs border', STATUS_CLASS[c.status])}>{STATUS_LABELS[c.status]}</Badge></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-foreground hover:bg-accent" onClick={() => openEdit(c)}><Edit className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className={cn('w-7 h-7 hover:bg-accent', c.status === 'published' ? 'text-warning' : 'text-success')} onClick={() => toggleStatus(c)} title={c.status === 'published' ? 'إلغاء النشر' : 'نشر'}>
                          {c.status === 'published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:bg-destructive/10" onClick={() => { setSelected(c); setDialogType('delete'); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogType === 'edit' || dialogType === 'create'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl bg-card border-border max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-cairo text-foreground">{dialogType === 'create' ? 'إنشاء كورس جديد' : 'تعديل الكورس'}</DialogTitle></DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-secondary">
              <TabsTrigger value="basic">معلومات أساسية</TabsTrigger>
              <TabsTrigger value="details">التفاصيل</TabsTrigger>
              <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-3 mt-3">
              <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">العنوان بالعربية *</Label><Input value={form.title_ar} onChange={e => setForm(p => ({ ...p, title_ar: e.target.value }))} className="bg-input border-border" /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">العنوان بالإنجليزية</Label><Input value={form.title_en} onChange={e => setForm(p => ({ ...p, title_en: e.target.value }))} className="bg-input border-border" /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">الوصف بالعربية</Label><Textarea value={form.description_ar} onChange={e => setForm(p => ({ ...p, description_ar: e.target.value }))} className="bg-input border-border resize-none" rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">التصنيف</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="bg-input border-border" /></div>
                <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">المستوى</Label>
                  <Select value={form.level} onValueChange={v => setForm(p => ({ ...p, level: v as CourseLevel }))}>
                    <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="beginner">مبتدئ</SelectItem><SelectItem value="intermediate">متوسط</SelectItem><SelectItem value="advanced">متقدم</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="details" className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">السعر (ج.م)</Label><Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} className="bg-input border-border" /></div>
                <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">سعر الخصم (ج.م)</Label><Input type="number" value={form.discount_price} onChange={e => setForm(p => ({ ...p, discount_price: Number(e.target.value) }))} className="bg-input border-border" /></div>
                <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">مدة الكورس (ساعات)</Label><Input type="number" value={form.duration_hours} onChange={e => setForm(p => ({ ...p, duration_hours: Number(e.target.value) }))} className="bg-input border-border" /></div>
                <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">صورة الغلاف (URL)</Label><Input value={form.cover_image_url} onChange={e => setForm(p => ({ ...p, cover_image_url: e.target.value }))} className="bg-input border-border" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">المتطلبات (سطر لكل متطلب)</Label><Textarea value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} className="bg-input border-border resize-none" rows={3} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">ماذا سيتعلم الطالب (سطر لكل نقطة)</Label><Textarea value={form.outcomes} onChange={e => setForm(p => ({ ...p, outcomes: e.target.value }))} className="bg-input border-border resize-none" rows={3} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal text-muted-foreground">الجمهور المستهدف (سطر لكل نقطة)</Label><Textarea value={form.target_audience} onChange={e => setForm(p => ({ ...p, target_audience: e.target.value }))} className="bg-input border-border resize-none" rows={2} /></div>
            </TabsContent>
            <TabsContent value="settings" className="space-y-4 mt-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"><div><p className="text-sm text-foreground">كورس مميز</p><p className="text-xs text-muted-foreground">يظهر في الواجهة الرئيسية</p></div><Switch checked={form.is_featured} onCheckedChange={v => setForm(p => ({ ...p, is_featured: v }))} /></div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"><div><p className="text-sm text-foreground">كورس مجاني</p><p className="text-xs text-muted-foreground">متاح للجميع بدون دفع</p></div><Switch checked={form.is_free} onCheckedChange={v => setForm(p => ({ ...p, is_free: v }))} /></div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogType(null)} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={saveCourse} disabled={actionLoading}>{actionLoading ? 'جاري الحفظ...' : dialogType === 'create' ? 'إنشاء الكورس' : 'حفظ التغييرات'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={dialogType === 'delete'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm bg-card border-border">
          <DialogHeader><DialogTitle className="font-cairo text-destructive">حذف الكورس</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">هل تريد حذف كورس <span className="text-foreground font-medium">"{selected?.title_ar}"</span>؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogType(null)} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={deleteCourse} disabled={actionLoading} className="bg-destructive text-white hover:bg-destructive/90">{actionLoading ? 'جاري...' : 'حذف نهائي'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AdminLayout>
  );
}
