import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Brain, Zap, BookOpen, Users, Award, Star, Shield, Clock,
  CheckCircle, GraduationCap, Play, Quote, Sparkles, Target,
  TrendingUp, CreditCard, Smartphone, Globe, Facebook, MessageCircle
} from 'lucide-react';
import type { Course } from '@/types/types';
import PublicLayout from '@/components/layouts/PublicLayout';

const IMG_INSTRUCTOR = 'https://zyytenpbedirhnrwiizg.supabase.co/storage/v1/object/public/assets/instructor/ahmed-aljohary.jpg';

const TESTIMONIALS = [
  { name: 'أميرة مدحت', role: 'صانعة محتوى رقمي', text: 'الأكاديمية فتحت لي آفاقاً جديدة في إنتاج المحتوى بالذكاء الاصطناعي.' },
  { name: 'أسماء السبكي', role: 'مهندسة برمجيات', text: 'الشرح العملي والتطبيقات الحقيقية هي ما يميّز هذه الأكاديمية.' },
  { name: 'برانديت سامي', role: 'مصممة جرافيك', text: 'الآن أستخدم أدوات AI يومياً في تصميماتي بفضل الأكاديمية.' },
  { name: 'ياسر عيسى', role: 'محلل بيانات', text: 'محتوى عربي بجودة عالمية. المنهج متسلسل ومنظّم بشكل ممتاز.' },
  { name: 'تامر خليفة', role: 'رائد أعمال', text: 'تعلّمت كيف أوظّف الذكاء الاصطناعي في تطوير أعمالي.' },
  { name: 'بيشوي مجدي', role: 'مطوّر ويب', text: 'أسلوب الأستاذ أحمد يجعل المفاهيم المعقدة بسيطة وواضحة.' },
];

const FEATURES = [
  { icon: BookOpen, title: 'محتوى عربي أصيل', desc: 'كورسات مُعدّة بعناية بمحتوى عربي احترافي من الصفر' },
  { icon: Shield, title: 'محتوى محمي', desc: 'روابط مؤقتة وتشفير متقدم لحماية المحتوى التعليمي' },
  { icon: Award, title: 'شهادات معتمدة', desc: 'شهادة PDF مخصصة بعد إتمام كل كورس بنجاح' },
  { icon: Clock, title: 'تعلّم في وقتك', desc: 'محتوى مسجّل تشاهده متى شئت من أي مكان' },
  { icon: Target, title: 'تطبيقات عملية', desc: 'مشاريع حقيقية على بيانات وسيناريوهات واقعية' },
  { icon: Users, title: 'دعم فني متواصل', desc: 'فريق الأكاديمية متاح لمساعدتك طوال رحلتك' },
];

const PAYMENT_METHODS = [
  { name: 'فودافون كاش', icon: Smartphone, detail: '01069689082', color: 'bg-red-500/10 text-red-500' },
  { name: 'إنستا باي', icon: CreditCard, detail: 'sofa79@instapay', link: 'https://ipn.eg/S/sofa79/instapay/0HH2Da', color: 'bg-purple-500/10 text-purple-500' },
  { name: 'باي بال', icon: Globe, detail: 'paypal.me/Farouk1981', link: 'https://paypal.me/Farouk1981', color: 'bg-blue-500/10 text-blue-500' },
];

function TestimonialsCarousel() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = TESTIMONIALS.length;
  const visibleCount = typeof window !== 'undefined' && window.innerWidth >= 768 ? 3 : 1;
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive(p => (p + 1) % total), 4000);
  }, [total]);
  useEffect(() => { startTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [startTimer]);
  const goTo = (i: number) => { setActive(i); startTimer(); };
  const visible: typeof TESTIMONIALS = [];
  for (let i = 0; i < visibleCount; i++) visible.push(TESTIMONIALS[(active + i) % total]);

  return (
    <section className="py-24 px-4 bg-card/30 border-y border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-5">
            <Star className="w-4 h-4 fill-primary" /> آراء حقيقية من متدربينا
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">ماذا يقول طلابنا؟</h2>
          <p className="text-muted-foreground max-w-md mx-auto text-lg">تجارب حقيقية غيّرت مسارات مهنية</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {visible.map((t, i) => (
            <Card key={`${t.name}-${active}-${i}`} className="h-full hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
              <CardContent className="p-7 flex flex-col gap-5 h-full">
                <div className="flex items-center justify-between">
                  <Quote className="w-8 h-8 text-primary/20" />
                  <div className="flex gap-0.5">{[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
                </div>
                <p className="text-muted-foreground leading-relaxed flex-1 text-base">"{t.text}"</p>
                <div className="pt-4 border-t border-border/50 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-primary font-bold">{t.name.charAt(0)}</span></div>
                  <div><p className="font-semibold text-foreground">{t.name}</p><p className="text-sm text-muted-foreground">{t.role}</p></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className={`transition-all duration-300 rounded-full ${i === active ? 'w-8 h-2.5 bg-primary' : 'w-2.5 h-2.5 bg-border hover:bg-primary/40'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({ students: 0, courses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [{ data: c }, { count: students }, { count: coursesCount }] = await Promise.all([
          supabase.from('courses').select('*').eq('status', 'published').eq('is_featured', true).order('students_count', { ascending: false }).limit(6),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
          supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        ]);
        setCourses((c || []) as Course[]);
        setStats({ students: students || 0, courses: coursesCount || 0 });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  return (
    <PublicLayout>
    <div className="min-h-screen bg-background text-foreground" dir="rtl">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 -z-10">
          <img src="/images/hero-bg.png" alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-background/80" />
          <div className="absolute top-1/3 right-0 w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="w-full max-w-7xl mx-auto px-6 md:px-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" /> أكاديمية الذكاء الاصطناعي الأولى بالعربية
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="block text-foreground">أكاديمية</span>
                <span className="block text-primary">الجوهري</span>
                <span className="block text-3xl md:text-4xl lg:text-5xl mt-2 text-muted-foreground font-semibold">للذكاء الاصطناعي</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                تعلّم الذكاء الاصطناعي بمحتوى عربي احترافي. كورسات متخصصة، شهادات معتمدة، ومجتمع يساعدك على الوصول لأعلى مستويات الاحتراف.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/courses">
                  <Button size="lg" className="gap-3 w-full sm:w-auto px-10 py-6 text-lg bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg shadow-primary/25">
                    <BookOpen className="w-5 h-5" /> استعرض الكورسات
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg" className="gap-3 w-full sm:w-auto px-10 py-6 text-lg rounded-2xl border-2">
                    <Play className="w-5 h-5" /> ابدأ مجاناً
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                {[
                  { label: 'طالب', value: loading ? '—' : `${stats.students}+`, icon: GraduationCap },
                  { label: 'كورس', value: loading ? '—' : `${stats.courses}`, icon: BookOpen },
                  { label: 'خبير', value: '١', icon: Award },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <s.icon className="w-5 h-5 text-primary" />
                    <span className="text-xl font-bold text-foreground">{s.value}</span>
                    <span className="text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/15 blur-3xl scale-110" />
                <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl">
                  <img src={IMG_INSTRUCTOR} alt="م. أحمد الجوهري" className="w-full h-full object-cover object-top" />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-card rounded-2xl p-3 shadow-xl border border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
                    <span className="text-xs text-muted-foreground font-medium">م. أحمد الجوهري</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT INSTRUCTOR ═══ */}
      <section className="py-24 px-6 bg-card/50 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-5">
              <Users className="w-4 h-4" /> عن الأكاديمية
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">رحلتك نحو الاحتراف في الذكاء الاصطناعي تبدأ هنا</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                أكاديمية الجوهري للذكاء الاصطناعي (GAIS) هي أول أكاديمية عربية متخصصة في تعليم الذكاء الاصطناعي بمحتوى عربي احترافي. تقدّم كورسات متخصصة من أساسيات AI وصولاً إلى النماذج اللغوية الكبيرة وتطبيقاتها العملية.
              </p>
              <div className="space-y-4">
                {['محتوى عربي أصيل يُعدّ بعناية من قبل خبراء', 'تطبيقات عملية حقيقية على مشاريع فعلية', 'دعم مباشر من المدرّب وفريق الأكاديمية', 'شهادات معتمدة تُعتدّ بها في سوق العمل'].map(t => (
                  <div key={t} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-foreground font-medium">{t}</span>
                  </div>
                ))}
              </div>
              <Link to="/about"><Button variant="outline" className="gap-2 rounded-xl mt-4 px-6 py-5 text-base border-2">تعرّف أكثر على الأكاديمية</Button></Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="/images/ai-classroom.png" alt="فصل دراسي" className="rounded-2xl w-full h-48 object-cover shadow-lg" />
              <img src="/images/ai-tech.png" alt="تقنية AI" className="rounded-2xl w-full h-48 object-cover shadow-lg mt-8" />
              <img src="/images/ai-learning.png" alt="تعلّم" className="rounded-2xl w-full h-48 object-cover shadow-lg -mt-4" />
              <img src="/images/ai-certificate.png" alt="شهادة" className="rounded-2xl w-full h-48 object-cover shadow-lg mt-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-5">
              <Zap className="w-4 h-4" /> لماذا تختار أكاديمية GAIS؟
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">كل ما تحتاجه لتصبح خبيراً</h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">في مجال الذكاء الاصطناعي</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <Card key={f.title} className="group hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 border-border/50 hover:border-primary/20">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <f.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <TestimonialsCarousel />

      {/* ═══ INSTRUCTOR ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-5">
            <GraduationCap className="w-4 h-4" /> تعرّف على المدرب
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">خبير الذكاء الاصطناعي ومؤسس الأكاديمية</h2>
          <Card className="max-w-2xl mx-auto mt-10 overflow-hidden">
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shrink-0">
                <img src={IMG_INSTRUCTOR} alt="م. أحمد الجوهري" className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-right space-y-3">
                <h3 className="text-2xl font-bold text-foreground">م. أحمد الجوهري</h3>
                <p className="text-muted-foreground">Ahmed Gohary — مؤسس أكاديمية GAIS</p>
                <p className="text-muted-foreground leading-relaxed">مهندس ومتخصص في الذكاء الاصطناعي بخبرة عملية واسعة. أسّس الأكاديمية لتكون المنصة العربية الأولى لتعليم تقنيات AI.</p>
                <div className="flex gap-3 justify-center md:justify-start pt-2">
                  <a href="https://www.facebook.com/share/19fGRt4DjM/" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1877F2] text-white text-sm font-medium shadow-md hover:shadow-lg transition-all">
                    <Facebook className="w-4 h-4" /> فيسبوك
                  </a>
                  <a href="https://wa.me/201069689082" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-medium shadow-md hover:shadow-lg transition-all">
                    <MessageCircle className="w-4 h-4" /> واتساب
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══ PAYMENT METHODS ═══ */}
      <section className="py-24 px-6 bg-card/50 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-5">
              <CreditCard className="w-4 h-4" /> وسائل الدفع المتاحة
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">ادفع بالطريقة الأنسب لك</h2>
            <p className="text-lg text-muted-foreground">نوفّر لك عدة وسائل دفع آمنة وسريعة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAYMENT_METHODS.map(pm => (
              <Card key={pm.name} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-primary/20">
                <CardContent className="p-8 text-center space-y-5">
                  <div className={`w-16 h-16 rounded-2xl ${pm.color} flex items-center justify-center mx-auto`}>
                    <pm.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{pm.name}</h3>
                  <p className="text-muted-foreground font-mono text-sm ltr-number" dir="ltr">{pm.detail}</p>
                  {pm.link && (
                    <a href={pm.link} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="gap-2 rounded-xl w-full mt-2 border-2 hover:bg-primary/5 hover:border-primary/30">
                        ادفع الآن
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">ابدأ رحلتك في الذكاء الاصطناعي اليوم</h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            انضم لآلاف الطلاب الذين غيّروا مساراتهم المهنية مع أكاديمية GAIS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-3 px-10 py-6 text-lg bg-primary text-white rounded-2xl shadow-lg shadow-primary/25">
                <Zap className="w-5 h-5" /> سجّل مجاناً الآن
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" size="lg" className="gap-3 px-10 py-6 text-lg rounded-2xl border-2">
                <BookOpen className="w-5 h-5" /> استعرض الكورسات
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
    </PublicLayout>
  );
}
