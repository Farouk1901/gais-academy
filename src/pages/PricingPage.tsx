import { Check, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import PublicLayout from '@/components/layouts/PublicLayout';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
}

const plans: Plan[] = [
  {
    id: 'single',
    name: 'كورس واحد',
    price: 'حسب سعر الكورس',
    period: '',
    description: 'ادفع مرة واحدة واحصل على وصول دائم لكورس بعينه.',
    features: [
      'وصول كامل لجميع دروس الكورس',
      'مشاهدة الفيديوهات داخل المنصة',
      'تتبع تقدمك الشخصي',
      'شهادة إتمام معتمدة',
      'دعم فني عبر التذاكر',
    ],
    cta: 'تصفح الكورسات',
    highlighted: false,
  },
  {
    id: 'bundle',
    name: 'باقة الكورسات',
    price: 'سعر مخفض',
    period: 'دفع لمرة واحدة',
    description: 'اشترك في أكثر من كورس بسعر خاص مقارنةً بالشراء المنفرد.',
    features: [
      'وصول لأكثر من كورس بسعر مخفض',
      'جميع مميزات الكورس الواحد',
      'أولوية في الدعم الفني',
      'إشعارات بالمحتوى الجديد',
      'شهادات إتمام لكل كورس',
    ],
    cta: 'تواصل معنا',
    highlighted: true,
    badge: 'الأكثر قيمةً',
  },
];

const faqs = [
  {
    q: 'هل الدفع مرة واحدة فقط؟',
    a: 'نعم، جميع كورساتنا تُشترى بدفع لمرة واحدة فقط دون أي رسوم شهرية أو متكررة.',
  },
  {
    q: 'ما هي طرق الدفع المتاحة؟',
    a: 'نقبل Vodafone Cash، InstaPay، التحويل البنكي، Paymob، Fawry، وStripe. بعض الطرق تتطلب مراجعة يدوية من الإدارة قبل تفعيل الوصول.',
  },
  {
    q: 'متى يُفعَّل الكورس بعد الدفع؟',
    a: 'بعد إرسال بيانات الدفع، تقوم إدارة المنصة بمراجعة العملية يدوياً وتفعيل الوصول في غضون 24 ساعة عادةً.',
  },
  {
    q: 'هل يمكنني استرداد المبلغ؟',
    a: 'يمكن طلب الاسترداد خلال 7 أيام من تفعيل الاشتراك إذا لم تتجاوز نسبة المشاهدة 20% من الكورس.',
  },
  {
    q: 'هل هناك كوبونات خصم؟',
    a: 'نعم، نوفر كوبونات خصم دورياً. تابع صفحاتنا على التواصل الاجتماعي للحصول على أحدث العروض، أو تواصل مع الدعم الفني.',
  },
  {
    q: 'كيف أحصل على شهادة الإتمام؟',
    a: 'تُصدر الشهادة تلقائياً بعد إكمال جميع دروس الكورس، ويمكن تنزيلها من لوحة التحكم الخاصة بك.',
  },
];

export default function PricingPage() {
  return (
    <PublicLayout>
      <div dir="rtl" className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24 space-y-20">

        {/* ── Hero ── */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
            أسعار بسيطة وشفافة
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto text-pretty">
            ادفع مرة واحدة واحصل على وصول كامل ودائم. لا رسوم خفية، لا اشتراكات شهرية.
          </p>
        </div>

        {/* ── Plans ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-6 flex flex-col gap-5 transition-shadow duration-200 h-full
                ${plan.highlighted
                  ? 'border-primary shadow-sm'
                  : 'border-border hover:border-primary/20 hover:shadow-sm'
                }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-5">
                  <Badge className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div>
                <h2 className="text-base font-semibold text-foreground">{plan.name}</h2>
                <p className="text-xl font-bold text-foreground mt-1">{plan.price}
                  {plan.period && (
                    <span className="text-xs font-normal text-muted-foreground mr-1">/ {plan.period}</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-2 text-pretty">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link to={plan.id === 'bundle' ? '/contact' : '/courses'} className="mt-auto">
                <Button
                  className={`w-full ${plan.highlighted ? '' : 'variant-outline'}`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  size="sm"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* ── Payment methods ── */}
        <div className="border-t border-border pt-10">
          <p className="text-sm text-muted-foreground text-center mb-6">طرق الدفع المقبولة</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Vodafone Cash', 'InstaPay', 'Fawry', 'Paymob', 'Stripe', 'تحويل بنكي', 'دفع يدوي'].map(m => (
              <span key={m} className="text-xs border border-border rounded-md px-3 py-1.5 text-muted-foreground bg-muted">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">أسئلة شائعة حول الأسعار</h2>
          </div>
          <Accordion type="single" collapsible className="divide-y divide-border">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-0 py-1">
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-3 text-right">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3 text-pretty">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* ── CTA ── */}
        <div className="border-t border-border pt-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground text-pretty max-w-md mx-auto">
            لديك سؤال أو تحتاج عرضاً خاصاً لمجموعة أو شركة؟ تواصل معنا مباشرةً.
          </p>
          <Link to="/contact">
            <Button variant="outline" size="sm">تواصل معنا</Button>
          </Link>
        </div>

      </div>
    </PublicLayout>
  );
}

