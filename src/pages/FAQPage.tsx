import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PublicLayout from '@/components/layouts/PublicLayout';

const faqCategories = [
  {
    category: 'الاشتراك والدفع',
    faqs: [
      { q: 'كيف أشترك في كورس؟', a: 'اختر الكورس الذي تريده، اضغط على "اشترك الآن"، اختر طريقة الدفع المناسبة، وأتمّ عملية الدفع.' },
      { q: 'ما هي طرق الدفع المتاحة؟', a: 'نقبل Vodafone Cash، InstaPay، التحويل البنكي، Paymob، Fawry، وStripe. بعض الطرق تحتاج موافقة يدوية من الإدارة.' },
      { q: 'هل يمكنني استرداد المبلغ؟', a: 'يمكنك طلب استرداد المبلغ خلال 7 أيام من الشراء إذا لم تكن قد أتممت أكثر من 20% من الكورس.' },
      { q: 'هل هناك خصومات؟', a: 'نعم، نوفر كوبونات خصم دورياً. تابع صفحاتنا على السوشيال ميديا للحصول على أحدث العروض.' },
    ],
  },
  {
    category: 'المحتوى والتعلم',
    faqs: [
      { q: 'هل يمكنني مشاهدة الكورسات دون الإنترنت؟', a: 'حالياً الكورسات تتطلب اتصالاً بالإنترنت. نعمل على توفير إمكانية التحميل في المستقبل.' },
      { q: 'كم من الوقت يستغرق كل كورس؟', a: 'يتفاوت الوقت حسب الكورس، من 10 ساعات للكورسات القصيرة إلى 50 ساعة للكورسات الشاملة.' },
      { q: 'هل يمكنني المشاهدة بأي سرعة؟', a: 'نعم، يمكنك التحكم في سرعة التشغيل من 0.75x إلى 2x.' },
    ],
  },
  {
    category: 'الشهادات',
    faqs: [
      { q: 'كيف أحصل على شهادة الإتمام؟', a: 'بعد إتمام جميع دروس الكورس واجتياز الاختبار النهائي، يتم إصدار الشهادة تلقائياً في لوحة التحكم.' },
      { q: 'هل الشهادات معتمدة دولياً؟', a: 'شهاداتنا صادرة من أكاديمية الجوهري. نعمل على الحصول على اعتمادات دولية. كل شهادة تحمل رمز QR للتحقق.' },
    ],
  },
  {
    category: 'الحساب والدعم',
    faqs: [
      { q: 'نسيت كلمة المرور، ماذا أفعل؟', a: 'اضغط على "نسيت كلمة المرور" في صفحة تسجيل الدخول وسيتم إرسال رابط لإعادة التعيين.' },
      { q: 'كيف أتواصل مع الدعم الفني؟', a: 'يمكنك فتح تذكرة دعم من لوحة التحكم أو التواصل عبر البريد الإلكتروني: support@gais.academy' },
      { q: 'هل يمكنني استخدام الحساب على أجهزة متعددة؟', a: 'نعم، يمكن الدخول من جهازين في آن واحد. الدخول المتعدد المشبوه قد يؤدي لتقييد الحساب.' },
    ],
  },
];

export default function FAQPage() {
  return (
    <PublicLayout>
      <div className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">الأسئلة الشائعة</h1>
          <p className="text-muted-foreground text-sm">إجابات شاملة على أسئلتك حول المنصة</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10 max-w-3xl space-y-8">
        {faqCategories.map(cat => (
          <div key={cat.category}>
            <h2 className="text-base font-bold text-foreground mb-4 border-b border-border pb-2">
              {cat.category}
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              {cat.faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`${cat.category}-${i}`}
                  className="border border-border rounded-lg px-4 bg-card"
                >
                  <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-3.5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}



