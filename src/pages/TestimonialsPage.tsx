import PublicLayout from '@/components/layouts/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  { name: 'أحمد محمد السيد',  role: 'مطوّر برمجيات',    stars: 5, text: 'أكاديمية الجوهري غيّرت مساري المهني بالكامل. تعلّمت الذكاء الاصطناعي من الصفر وأصبحت أعمل في شركة تقنية كبرى.' },
  { name: 'سارة عبدالله',      role: 'محللة بيانات',      stars: 5, text: 'المحتوى العربي الاحترافي يميّز الأكاديمية عن كل المنصات الأخرى. شرح واضح وتطبيقات عملية حقيقية.' },
  { name: 'محمد الحسن',        role: 'رائد أعمال',        stars: 5, text: 'استثمرت في الكورسات وعادت عليّ بعشرة أضعاف. الآن أقدّم خدمات الذكاء الاصطناعي لشركات كبرى.' },
  { name: 'فاطمة الزهراء',    role: 'مهندسة بيانات',     stars: 5, text: 'تنظيم المحتوى وجودة الشرح لا مثيل لهما. أنصح كل من يريد دخول مجال AI بالبدء من هنا.' },
  { name: 'خالد العمري',       role: 'مدير مشاريع',       stars: 5, text: 'ساعدتني الأكاديمية على دمج الذكاء الاصطناعي في إدارة مشاريعي، مما وفّر وقتاً وجهداً كبيرين.' },
  { name: 'نورة القحطاني',     role: 'مصممة جرافيك',     stars: 5, text: 'كنت أعتقد أن AI معقد جداً، لكن الأستاذ أحمد جعله سهلاً وممتعاً. الآن أستخدمه في عملي اليومي.' },
];

export default function TestimonialsPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 py-20" dir="rtl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">آراء المتدربين</h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto text-pretty">
            اكتشف كيف غيّرت أكاديمية الجوهري مسارات مئات المتدربين
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map(t => (
            <Card key={t.name} className="h-full flex flex-col">
              <CardContent className="p-5 flex flex-col gap-3 h-full">
                <Quote className="w-5 h-5 text-primary/40 shrink-0" />
                <p className="text-sm text-muted-foreground text-pretty leading-relaxed flex-1">"{t.text}"</p>
                <div>
                  <div className="flex gap-0.5 mb-1.5">
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
    </PublicLayout>
  );
}
