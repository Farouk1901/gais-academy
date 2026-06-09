import { Link } from 'react-router-dom';
import PublicLayout from '@/components/layouts/PublicLayout';

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-2">سياسة الخصوصية</h1>
          <p className="text-muted-foreground text-sm">آخر تحديث: يونيو 2025</p>
        </div>

        <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. المعلومات التي نجمعها</h2>
            <p className="mb-2">عند التسجيل أو استخدام المنصة، قد نجمع:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              <li>الاسم الكامل وعنوان البريد الإلكتروني.</li>
              <li>رقم الهاتف (اختياري).</li>
              <li>بيانات التقدم في التعلم والدروس المكتملة.</li>
              <li>معلومات الدفع (مرجع العملية — لا نخزن بيانات البطاقات).</li>
              <li>بيانات الجهاز والمتصفح لأغراض الأمان.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. كيف نستخدم معلوماتك</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              <li>لتقديم خدمات التعلم وإدارة حسابك.</li>
              <li>لمعالجة المدفوعات والتحقق من الاشتراكات.</li>
              <li>لإرسال إشعارات متعلقة بالكورسات والشهادات.</li>
              <li>لتحسين جودة المحتوى والمنصة.</li>
              <li>لضمان أمان الحساب والكشف عن الاستخدام غير المشروع.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. حماية البيانات</h2>
            <p>
              نستخدم Supabase كبنية تحتية لقاعدة البيانات مع تشفير SSL/TLS لجميع الاتصالات.
              كلمات المرور مشفرة ولا يمكن لأي موظف الاطلاع عليها. بيانات الدفع لا تُخزن على
              خوادمنا مباشرة.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. مشاركة البيانات</h2>
            <p>
              لا نبيع أو نشارك بياناتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 mt-2">
              <li>بموافقتك الصريحة.</li>
              <li>عند الضرورة القانونية بناءً على طلب رسمي من الجهات المختصة.</li>
              <li>مع مزودي خدمات الدفع لمعالجة المعاملات فقط.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. ملفات الارتباط (Cookies)</h2>
            <p>
              نستخدم ملفات الارتباط الضرورية فقط لتتبع جلسة تسجيل الدخول وضمان تجربة
              مستخدم متواصلة. لا نستخدم ملفات ارتباط تتبع للإعلانات.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. حقوقك</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              <li>الحق في الوصول إلى بياناتك الشخصية.</li>
              <li>الحق في تصحيح أي بيانات غير دقيقة.</li>
              <li>الحق في طلب حذف حسابك وبياناتك.</li>
              <li>الحق في الاعتراض على معالجة بياناتك.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. الاحتفاظ بالبيانات</h2>
            <p>
              نحتفظ ببياناتك طوال فترة نشاط حسابك. بعد حذف الحساب، يتم حذف البيانات الشخصية
              خلال 30 يوم، مع الاحتفاظ بسجلات المعاملات لمدة 7 سنوات لمتطلبات قانونية.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. التواصل</h2>
            <p>
              لممارسة أي من حقوقك أو للاستفسار عن سياسة الخصوصية، تواصل معنا عبر{' '}
              <Link to="/contact" className="text-primary hover:underline">صفحة التواصل</Link>.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}

