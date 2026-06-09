import PublicLayout from '@/components/layouts/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, GraduationCap } from 'lucide-react';

const testimonials = [
  { name: 'أميرة مدحت',     role: 'صانعة محتوى رقمي',      stars: 5, text: 'الأكاديمية فتحت لي آفاقاً جديدة في إنتاج المحتوى بالذكاء الاصطناعي. أصبحت أُنجز أعمالي بسرعة وجودة لم أكن أتخيلها.' },
  { name: 'أسماء السبكي',    role: 'مهندسة برمجيات',         stars: 5, text: 'الشرح العملي والتطبيقات الحقيقية هي ما يميّز هذه الأكاديمية. تعلّمت تقنيات الذكاء الاصطناعي بطريقة سلسة واحترافية.' },
  { name: 'برانديت سامي',    role: 'مصممة جرافيك',          stars: 5, text: 'كنت أعتقد أن الذكاء الاصطناعي بعيد عن مجالي، لكن الأكاديمية أثبتت لي العكس. الآن أستخدم أدوات AI يومياً في تصميماتي.' },
  { name: 'ياسر عيسى',       role: 'محلل بيانات',            stars: 5, text: 'محتوى عربي بجودة عالمية. المنهج متسلسل ومنظّم بشكل ممتاز من الأساسيات حتى التطبيقات المتقدمة.' },
  { name: 'تامر خليفة',      role: 'رائد أعمال',             stars: 5, text: 'استثماري في كورسات الأكاديمية كان من أفضل قراراتي المهنية. تعلّمت كيف أوظّف الذكاء الاصطناعي في تطوير أعمالي.' },
  { name: 'بيشوي مجدي',      role: 'مطوّر ويب',              stars: 5, text: 'أسلوب الأستاذ أحمد في الشرح يجعل المفاهيم المعقدة بسيطة وواضحة. أنصح أي مبرمج بالانضمام لهذه الأكاديمية.' },
  { name: 'أحمد عز الدين',   role: 'مهندس ذكاء اصطناعي',    stars: 5, text: 'الكورسات ساعدتني على الانتقال من البرمجة التقليدية إلى مجال الذكاء الاصطناعي. المحتوى العملي هو نقطة القوة الأساسية.' },
  { name: 'هناء سلطان',      role: 'أخصائية تسويق رقمي',    stars: 5, text: 'تعلّمت استخدام أدوات AI في التسويق الرقمي وتحليل البيانات. الأكاديمية غيّرت طريقة عملي بالكامل.' },
  { name: 'أماني عيسى',      role: 'باحثة أكاديمية',         stars: 5, text: 'الدعم المستمر من فريق الأكاديمية والمجتمع التعليمي المتميز جعلا تجربة التعلم ممتعة وفعّالة.' },
];

export default function TestimonialsPage() {
  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 py-20" dir="rtl">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-5">
            <GraduationCap className="w-4 h-4" />
            قصص نجاح حقيقية
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">آراء المتدربين</h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto text-pretty leading-relaxed">
            تعرّف على تجارب متدربينا الحقيقية وكيف ساعدتهم الأكاديمية في تطوير مهاراتهم
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Card key={t.name} className="h-full flex flex-col group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 flex flex-col gap-4 h-full">
                <Quote className="w-8 h-8 text-primary/20 shrink-0 group-hover:text-primary/40 transition-colors" />
                <p className="text-sm text-muted-foreground text-pretty leading-relaxed flex-1">"{t.text}"</p>
                <div className="pt-3 border-t border-border/50">
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-sm">{t.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

