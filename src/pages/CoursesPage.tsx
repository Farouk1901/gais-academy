import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/components/layouts/PublicLayout';
import CourseCard from '@/components/common/CourseCard';
import { supabase } from '@/db/supabase';
import type { Course, Category } from '@/types/types';

const levelOptions = [
  { value: '', label: 'الكل' },
  { value: 'beginner', label: 'مبتدئ' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'متقدم' },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const hasFilters = search.trim() !== '' || selectedCategory !== '' || selectedLevel !== '';

  useEffect(() => {
    supabase.from('categories').select('*').order('name_ar').then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('courses')
        .select('*, categories!courses_category_id_fkey(id, name_ar)')
        .eq('status', 'published')
        .order('students_count', { ascending: false });

      if (selectedLevel) query = query.eq('level', selectedLevel);
      if (selectedCategory) query = query.eq('category_id', selectedCategory);
      if (search.trim()) query = query.ilike('title_ar', `%${search.trim()}%`);

      const { data, error } = await query;
      if (error) console.error('Courses fetch error:', error.message);
      setCourses(Array.isArray(data) ? (data as Course[]) : []);
    } catch (err) {
      console.error('fetchCourses exception:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedLevel]);

  useEffect(() => {
    const t = setTimeout(fetchCourses, 300);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  const clearFilters = () => { setSearch(''); setSelectedCategory(''); setSelectedLevel(''); };

  return (
    <PublicLayout>
      {/* ── Page Header ── */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <p className="text-primary text-sm font-medium mb-2">المكتبة التعليمية</p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2 text-balance">
            الكورسات
          </h1>
          <p className="text-muted-foreground text-sm">
            {loading ? 'جاري التحميل...' : `${courses.length} كورس في مجال الذكاء الاصطناعي`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* ── Search + Level filters ── */}
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute top-1/2 end-3 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="ابحث بالاسم أو الكلمة المفتاحية..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pe-10 bg-card border-border h-10"
            />
          </div>

          {/* Level pills */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {levelOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedLevel(opt.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                  selectedLevel === opt.value
                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Category chips ── */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-full text-xs transition-all duration-150 border ${
                selectedCategory === ''
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/25 hover:text-foreground'
              }`}
            >
              الكل
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                className={`px-3 py-1 rounded-full text-xs transition-all duration-150 border ${
                  selectedCategory === cat.id
                    ? 'bg-primary/15 text-primary border-primary/30'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/25 hover:text-foreground'
                }`}
              >
                {cat.name_ar}
              </button>
            ))}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs text-destructive border border-destructive/20 hover:bg-destructive/8 transition-colors"
              >
                <X className="h-3 w-3" />
                مسح الفلاتر
              </button>
            )}
          </div>
        )}

        {/* ── Course Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold font-heading mb-1">لا توجد نتائج</p>
            <p className="text-muted-foreground text-sm mb-5">
              لا توجد كورسات تطابق بحثك أو الفلاتر المحددة
            </p>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/8 border border-primary/20" onClick={clearFilters}>
              إعادة تعيين الفلاتر
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}





