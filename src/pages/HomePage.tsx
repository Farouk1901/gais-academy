import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Brain, Zap, BookOpen, Users, Award, ArrowLeft, Star,
  Shield, Clock, CheckCircle, GraduationCap, Play,
  ChevronLeft, Quote, Sparkles, Target, TrendingUp
} from 'lucide-react';
import type { Course } from '@/types/types';
import ImageSlider from '@/components/common/ImageSlider';

// ── Image constants (AI / training themed) ───────────────────────────────
const IMG_HERO_INSTRUCTOR = 'https://zyytenpbedirhnrwiizg.supabase.co/storage/v1/object/public/assets/instructor/ahmed-aljohary.jpg';
const IMG_AI_NEURAL        = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_565225e9-e587-4e56-bc47-c3384b19ce59.jpg';
const IMG_STUDENTS         = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_09668b2c-07e4-4e01-8199-39e15378fd3d.jpg';
const IMG_AI_ROBOT         = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_06272bce-72b4-4431-ad4e-34b7e2ec572d.jpg';
const IMG_CODING           = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_497739f6-6b6c-42f0-8839-27e842d0aeb3.jpg';
const IMG_CHATBOT          = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_3becce16-b4b5-4b45-a883-ae7ac88ae3fc.jpg';

// ── Slider images ──────────────────────────────────────────────────────────
const SLIDER_IMAGES = [
  { src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_565225e9-e587-4e56-bc47-c3384b19ce59.jpg', alt: 'شبكة ذكاء اصطناعي' },
  { src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_09668b2c-07e4-4e01-8199-39e15378fd3d.jpg', alt: 'طلاب يتعلمون' },
  { src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_06272bce-72b4-4431-ad4e-34b7e2ec572d.jpg', alt: 'روبوت AI' },
  { src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_497739f6-6b6c-42f0-8839-27e842d0aeb3.jpg', alt: 'برمجة وكود' },
  { src: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_3becce16-b4b5-4b45-a883-ae7ac88ae3fc.jpg', alt: 'شات بوت ذكاء اصطناعي' },
  { src: 'https://zyytenpbedirhnrwiizg.supabase.co/storage/v1/object/public/assets/instructor/ahmed-aljohary.jpg', alt: 'أحمد الجوهري' },
];

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
};

// ── Testimonials data ────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'أحمد محمد السيد',
    role: 'مطوّر برمجيات',
    text: 'أكاديمية الجوهري غيّرت مساري المهني بالكامل. تعلّمت الذكاء الاصطناعي من الصفر وأصبحت أعمل في شركة تقنية كبرى.',
    stars: 5,
  },
  {
    name: 'سارة عبدالله',
    role: 'محللة بيانات',
    text: 'المحتوى العربي الاحترافي يميّز الأكاديمية عن كل المنصات الأخرى. شرح واضح وتطبيقات عملية حقيقية.',
    stars: 5,
  },
  {
    name: 'محمد الحسن',
    role: 'رائد أعمال',
    text: 'استثمرت في الكورسات وعادت عليّ بعشرة أضعاف. الآن أقدّم خدمات الذكاء الاصطناعي لشركات كبرى.',
    stars: 5,
  },
];

// ── Course categories ────────────────────────────────────────────────────
const CATEGORIES = [
  { icon: Brain,      label: 'أساسيات الذكاء الاصطناعي', count: 'للمبتدئين' },
  { icon: TrendingUp, label: 'تعلّم الآلة',               count: 'متوسط - متقدم' },
  { icon: Sparkles,   label: 'نماذج اللغة الكبيرة',       count: 'ChatGPT · Gemini' },
  { icon: Target,     label: 'التطبيقات العملية',          count: 'مشاريع حقيقية' },
];

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({ students: 0, courses: 0, instructors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [{ data: c }, { count: students }, { count: coursesCount }] = await Promise.all([
          supabase.from('courses').select('*')
            .eq('status', 'published').eq('is_featured', true)
            .order('students_count', { ascending: false }).limit(6),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
          supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        ]);
        setCourses((c || []) as Course[]);
        setStats({ students: students || 0, courses: coursesCount || 0, instructors: 1 });
      } catch (err) {
        console.error('HomePage fetchAll error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">

      {/* ════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Background layers */}
        <div className="absolute inset-0 -z-10">
          <img
            src={IMG_AI_NEURAL}
            alt="خلفية ذكاء اصطناعي"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-background via-background/85 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
          {/* Glow accents */}
          <div className="absolute top-1/3 right-0 w-[40vw] h-[40vw] bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cyan-500/6 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text column */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                              border border-primary/25 bg-primary/8 text-primary text-xs font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                أكاديمية الذكاء الاصطناعي الأولى بالعربية
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-5">
                <span className="block">أكاديمية</span>
                <span className="block gradient-text">الجوهري</span>
                <span className="block text-3xl md:text-4xl lg:text-5xl mt-1 text-foreground/80">
                  للذكاء الاصطناعي
                </span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed text-pretty">
                تعلّم الذكاء الاصطناعي بمحتوى عربي احترافي. كورسات متخصصة، شهادات معتمدة، ومجتمع متخصص يساعدك على الوصول لأعلى مستويات الاحتراف.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link to="/courses">
                  <Button size="lg" className="gap-2 w-full sm:w-auto px-8 text-base">
                    <BookOpen className="w-5 h-5" />
                    استعرض الكورسات
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="ghost" size="lg"
                    className="gap-2 w-full sm:w-auto border border-border text-foreground hover:bg-accent px-8 text-base">
                    <Play className="w-4 h-4" />
                    ابدأ مجاناً
                  </Button>
                </Link>
              </div>

              {/* Quick stats row */}
              <div className="flex items-center gap-6 flex-wrap">
                {[
                  { label: 'طالب', value: loading ? '—' : `${(stats.students || 0).toLocaleString('ar-EG')}+`, icon: GraduationCap },
                  { label: 'كورس', value: loading ? '—' : `${stats.courses}`, icon: BookOpen },
                  { label: 'خبير', value: '١', icon: Award },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <s.icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-lg font-bold text-foreground">{s.value}</span>
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image column */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              {/* Founder photo — circular */}
              <div className="flex flex-col items-center gap-4">
                  {/* Circle ring + photo */}
                  <div className="relative">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-110" />
                    <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden
                                    border-4 border-primary/30 shadow-2xl">
                      <img
                        src={IMG_HERO_INSTRUCTOR}
                        alt="أحمد الجوهري - مؤسس الأكاديمية"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    {/* Floating badge — bottom left */}
                    <div className="absolute -bottom-2 -right-2 glass rounded-xl p-2.5 shadow-lg">
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                          <Zap className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-foreground leading-none">تعلّم فوري</p>
                          <p className="text-[9px] text-muted-foreground">٢٤/٧</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Name badge below circle */}
                  <div className="glass rounded-2xl px-5 py-3 flex items-center gap-3 shadow-md">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Brain className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">أ. أحمد الجوهري</p>
                      <p className="text-xs text-muted-foreground">مؤسس أكاديمية GAIS</p>
                    </div>
                    <div className="flex gap-0.5 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-warning text-warning" />
                      ))}
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════════════ */}
      <section className="py-10 px-4 border-y border-border bg-card/40">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'طالب مسجّل', value: loading ? null : `${(stats.students || 0).toLocaleString('ar-EG')}+`, icon: GraduationCap, color: 'text-primary' },
              { label: 'كورس متاح', value: loading ? null : String(stats.courses), icon: BookOpen, color: 'text-cyan-400' },
              { label: 'ساعة تدريبية', value: '٢٠٠+', icon: Clock, color: 'text-warning' },
              { label: 'نسبة رضا الطلاب', value: '٩٨٪', icon: Star, color: 'text-success' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1.5">
                <s.icon className={`w-6 h-6 mb-1 ${s.color}`} />
                {loading && s.value === null
                  ? <Skeleton className="h-8 w-16 bg-muted" />
                  : <p className={`text-2xl md:text-3xl font-bold ${s.color}`}>{s.value}</p>
                }
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          ABOUT / INSTRUCTOR SECTION
      ════════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image grid — instructor prominent top, AI scenes below */}
            <div className="grid grid-cols-2 gap-3">
              {/* Instructor — circular portrait */}
              <div className="col-span-2 flex flex-col items-center gap-3 py-2">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary/25 shadow-xl mx-auto">
                  <img src={IMG_HERO_INSTRUCTOR} alt="أحمد الجوهري - مؤسس الأكاديمية"
                    className="w-full h-full object-cover object-top" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">أ. أحمد الجوهري</p>
                  <p className="text-xs text-muted-foreground">مؤسس أكاديمية الجوهري للذكاء الاصطناعي</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden aspect-square">
                <img src={IMG_AI_ROBOT} alt="روبوت الذكاء الاصطناعي"
                  className="w-full h-full object-cover" />
              </div>
              <div className="rounded-xl overflow-hidden aspect-square">
                <img src={IMG_CODING} alt="تعلّم البرمجة والذكاء الاصطناعي"
                  className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                              border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-5">
                <Award className="w-3.5 h-3.5" />
                عن الأكاديمية
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-balance">
                رحلتك نحو الاحتراف في الذكاء الاصطناعي تبدأ هنا
              </h2>
              <p className="text-sm text-muted-foreground mb-5 text-pretty leading-relaxed">
                أكاديمية الجوهري للذكاء الاصطناعي (GAIS) هي أول أكاديمية عربية متخصصة في تعليم الذكاء الاصطناعي بمحتوى عربي احترافي. نقدّم كورسات متخصصة من أساسيات AI وصولاً إلى النماذج اللغوية الكبيرة وتطبيقاتها العملية في الأعمال.
              </p>
              <ul className="space-y-3 mb-7">
                {[
                  'محتوى عربي أصيل مُعدّ بعناية من قِبل خبراء',
                  'تطبيقات عملية حقيقية على مشاريع فعلية',
                  'دعم مباشر من المدرّب وفريق الأكاديمية',
                  'شهادات معتمدة يُعتدّ بها في سوق العمل',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/85">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/about">
                <Button variant="ghost" className="gap-2 border border-border text-foreground hover:bg-accent">
                  تعرّف أكثر على الأكاديمية
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CATEGORIES
      ════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-card/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 text-balance">تخصصات الأكاديمية</h2>
            <p className="text-sm text-muted-foreground">مسارات تعليمية متكاملة تأخذك من الصفر للاحتراف</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <Link to="/courses" key={cat.label}>
                <Card className="stat-card card-hover h-full group cursor-pointer">
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center
                                    group-hover:bg-primary/20 transition-colors">
                      <cat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-foreground leading-snug">{cat.label}</h3>
                      <p className="text-[10px] text-muted-foreground mt-1">{cat.count}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 text-balance">لماذا تختار أكاديمية GAIS؟</h2>
            <p className="text-sm text-muted-foreground">كل ما تحتاجه لتصبح خبيراً في الذكاء الاصطناعي</p>
          </div>

          {/* Feature with image split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-center">
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img src={IMG_CHATBOT} alt="الذكاء الاصطناعي والتعليم"
                className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: Zap,    title: 'محتوى حديث ومحدّث باستمرار', desc: 'يتوافق مع آخر التطورات في الذكاء الاصطناعي ويُحدَّث بانتظام.' },
                { icon: Shield, title: 'محتوى محمي بتقنيات متقدمة',   desc: 'روابط موقّعة تنتهي بعد ٦٠ دقيقة وعلامة مائية خاصة بكل طالب.' },
                { icon: Award,  title: 'شهادات معتمدة قابلة للتحقق',  desc: 'شهادة PDF مخصصة بعد إتمام كل كورس لإضافتها لسيرتك الذاتية.' },
                { icon: Users,  title: 'دعم فني وتعليمي متواصل',       desc: 'فريق الأكاديمية متاح لمساعدتك في أي وقت خلال رحلتك التعليمية.' },
              ].map(f => (
                <div key={f.title} className="flex gap-3 p-4 rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Clock,       title: 'تعلّم في وقتك',       desc: 'محتوى مسجل تشاهده في الوقت الذي يناسبك من أي مكان وأي جهاز.' },
              { icon: Brain,       title: 'منهج علمي متسلسل',    desc: 'مناهج مصممة بعناية تضمن تقدمك من المبتدئ إلى المحترف بخطوات واضحة.' },
            ].map(f => (
              <Card key={f.title} className="stat-card card-hover h-full">
                <CardContent className="p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 text-pretty leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURED COURSES
      ════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground text-balance">الكورسات المميزة</h2>
              <p className="text-sm text-muted-foreground mt-1">اختر الكورس المناسب وابدأ رحلتك</p>
            </div>
            <Link to="/courses">
              <Button variant="ghost" size="sm"
                className="border border-border text-foreground hover:bg-accent gap-1">
                عرض الكل <ArrowLeft className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-72 bg-muted rounded-lg" />)}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">لا توجد كورسات منشورة بعد</p>
              <p className="text-xs text-muted-foreground/60 mt-1">قريباً سيتم إضافة كورسات جديدة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(c => (
                <Link to={`/courses/${c.id}`} key={c.id}>
                  <Card className="stat-card card-hover h-full flex flex-col group">
                    <div className="aspect-[16/9] bg-secondary overflow-hidden rounded-t-lg relative">
                      {c.cover_image_url ? (
                        <img src={c.cover_image_url} alt={c.title_ar}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <Brain className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px] border border-primary/20 text-primary bg-primary/5">
                          {LEVEL_LABELS[c.level] || c.level}
                        </Badge>
                        {c.is_featured && (
                          <Badge variant="outline" className="text-[10px] border border-warning/20 text-warning bg-warning/5">
                            <Star className="w-2.5 h-2.5 ml-0.5" />مميز
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mb-2 leading-snug text-balance">
                        {c.title_ar}
                      </h3>
                      {c.description_ar && (
                        <p className="text-xs text-muted-foreground mb-3 text-pretty line-clamp-2">
                          {c.description_ar}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <p className="text-base font-bold text-primary">
                          {c.is_free ? 'مجاني' : `${Number(c.price).toLocaleString('ar-EG')} ج.م`}
                        </p>
                        {c.duration_hours && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />{c.duration_hours} ساعة
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 text-balance">كيف تبدأ رحلتك؟</h2>
            <p className="text-sm text-muted-foreground">أربع خطوات بسيطة للانطلاق</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-8 right-[12.5%] left-[12.5%] h-px bg-border z-0" />
            {[
              { num: '١', title: 'سجّل حسابك',    desc: 'أنشئ حساباً مجانياً في دقيقة', icon: Users,        color: 'bg-primary/10 border-primary/20 text-primary' },
              { num: '٢', title: 'اختر الكورس',   desc: 'تصفّح وابحث عن ما يناسبك',    icon: BookOpen,     color: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' },
              { num: '٣', title: 'أتمّ الدفع',    desc: 'ادفع بطريقتك المفضّلة',       icon: CheckCircle,  color: 'bg-warning/10 border-warning/20 text-warning' },
              { num: '٤', title: 'ابدأ التعلّم',  desc: 'محتوى فوري بعد الموافقة',     icon: Play,         color: 'bg-success/10 border-success/20 text-success' },
            ].map((step) => (
              <div key={step.num} className="relative z-10 flex flex-col items-center text-center gap-2">
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center shrink-0 ${step.color}`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <div className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center -mt-1">
                  <span className="text-[10px] font-bold text-foreground">{step.num}</span>
                </div>
                <h3 className="text-xs font-semibold text-foreground">{step.title}</h3>
                <p className="text-[10px] text-muted-foreground text-pretty">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-card/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 text-balance">ماذا يقول طلابنا؟</h2>
            <p className="text-sm text-muted-foreground">آراء حقيقية من طلاب غيّرت الأكاديمية مساراتهم</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map(t => (
              <Card key={t.name} className="stat-card h-full flex flex-col">
                <CardContent className="p-5 flex flex-col gap-4 h-full">
                  <Quote className="w-6 h-6 text-primary/40 shrink-0" />
                  <p className="text-sm text-muted-foreground text-pretty leading-relaxed flex-1">
                    "{t.text}"
                  </p>
                  <div>
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(t.stars)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          AUTO-SCROLLING IMAGE SLIDER
      ════════════════════════════════════════════════════ */}
      <section className="py-14 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 mb-6 text-center">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-1 text-balance">
            لحظات من رحلة طلابنا
          </h2>
          <p className="text-sm text-muted-foreground">صور من داخل الأكاديمية والكورسات</p>
        </div>
        {/* Fade masks on sides */}
        <div className="relative">
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <ImageSlider images={SLIDER_IMAGES} speed={50} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════ */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={IMG_AI_NEURAL} alt="" aria-hidden
            className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-background/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-cyan-500/8" />
        </div>
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-balance">
            ابدأ رحلتك في الذكاء الاصطناعي اليوم
          </h2>
          <p className="text-sm text-muted-foreground mb-7 text-pretty leading-relaxed">
            انضم لآلاف الطلاب الذين غيّروا مساراتهم المهنية مع أكاديمية GAIS وأصبحوا خبراء في الذكاء الاصطناعي
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-2 px-8">
                <Zap className="w-5 h-5" />
                سجّل مجاناً الآن
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="ghost" size="lg"
                className="gap-2 px-8 border border-border text-foreground hover:bg-accent">
                <BookOpen className="w-4 h-4" />
                استعرض الكورسات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════ */}
      <footer className="py-10 px-4 border-t border-border bg-card/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">أكاديمية الجوهري للذكاء الاصطناعي</p>
                  <p className="text-[10px] text-muted-foreground">GAIS — Algohary AI School</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-pretty leading-relaxed max-w-xs">
                أول أكاديمية عربية متخصصة في تعليم الذكاء الاصطناعي بمحتوى عربي احترافي ومعتمد.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-3">روابط سريعة</p>
              <ul className="space-y-2">
                {[
                  { to: '/courses', label: 'الكورسات' },
                  { to: '/about',   label: 'عن الأكاديمية' },
                  { to: '/contact', label: 'تواصل معنا' },
                  { to: '/faq',     label: 'الأسئلة الشائعة' },
                ].map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground mb-3">قانوني</p>
              <ul className="space-y-2">
                {[
                  { to: '/terms',   label: 'الشروط والأحكام' },
                  { to: '/privacy', label: 'سياسة الخصوصية' },
                ].map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} أكاديمية الجوهري للذكاء الاصطناعي. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
