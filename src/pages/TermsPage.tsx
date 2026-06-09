import { Link } from 'react-router-dom';
import PublicLayout from '@/components/layouts/PublicLayout';

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-2">الشروط والأحكام</h1>
          <p className="text-muted-foreground text-sm">آخر تحديث: يونيو 2025</p>
        </div>

        <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. القبول بالشروط</h2>
            <p>
              باستخدامك لمنصة أكاديمية الجوهري للذكاء الاصطناعي (GAIS)، فإنك توافق على الالتزام
              بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يُرجى عدم استخدام المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. الخدمات المقدمة</h2>
            <p>
              تقدم أكاديمية GAIS محتوى تعليمياً متخصصاً في مجال الذكاء الاصطناعي عبر الإنترنت.
              يشمل ذلك الكورسات المسجلة، والمواد التعليمية، والاختبارات، وشهادات الإتمام.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. الاشتراكات والمدفوعات</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              <li>الاشتراكات شخصية وغير قابلة للنقل أو المشاركة.</li>
              <li>لا تُسترد الرسوم المدفوعة بعد تفعيل الوصول للكورس.</li>
              <li>يتم تفعيل الوصول بعد التحقق من الدفع خلال 24 ساعة.</li>
              <li>يحق للأكاديمية تعديل الأسعار مع إشعار مسبق.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. حقوق الملكية الفكرية</h2>
            <p>
              جميع المحتويات المنشورة على المنصة — بما في ذلك الفيديوهات، والملاحظات، والمواد
              التعليمية — هي ملكية حصرية لأكاديمية GAIS. يُحظر نسخ أو توزيع أو إعادة نشر أي محتوى
              دون إذن خطي مسبق.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. سلوك المستخدم</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              <li>يُحظر مشاركة بيانات الدخول مع الآخرين.</li>
              <li>يُحظر محاولة تنزيل أو نسخ الفيديوهات بأي طريقة.</li>
              <li>يُحظر نشر المحتوى التعليمي على أي منصة أخرى.</li>
              <li>يُحظر أي سلوك غير لائق أو مسيء في قسم الدعم الفني.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. الشهادات</h2>
            <p>
              تُمنح شهادات الإتمام تلقائياً بعد اجتياز جميع دروس الكورس. الشهادات لأغراض
              تعليمية وتطويرية ولا تُمثل مؤهلاً أكاديمياً رسمياً معتمداً من جهات حكومية.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. التعديلات</h2>
            <p>
              تحتفظ أكاديمية GAIS بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين
              بأي تغييرات جوهرية عبر البريد الإلكتروني أو الإشعارات داخل المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. التواصل</h2>
            <p>
              لأي استفسارات حول هذه الشروط، تواصل معنا عبر{' '}
              <Link to="/contact" className="text-primary hover:underline">صفحة التواصل</Link>.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}

