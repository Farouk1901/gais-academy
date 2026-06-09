import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CreditCard, Upload, CheckCircle, BookOpen, ShieldCheck, Tag, X, Loader2 } from 'lucide-react';
import type { Course } from '@/types/types';

const PAYMENT_METHODS = [
  { value: 'vodafone_cash', label: 'Vodafone Cash', instructions: 'قم بتحويل المبلغ على رقم Vodafone Cash التالي:\n01XXXXXXXXXX\nثم أرسل صورة الإيصال أو رقم المعاملة.' },
  { value: 'instapay', label: 'InstaPay', instructions: 'قم بتحويل المبلغ على حساب InstaPay التالي:\ngais@instapay\nثم أرسل رقم المعاملة.' },
  { value: 'bank_transfer', label: 'تحويل بنكي', instructions: 'البنك: بنك مصر\nاسم الحساب: أكاديمية الجوهري للذكاء الاصطناعي\nرقم الحساب: XXXXXXXXXXXXXXXXXX\nأرسل صورة إيصال التحويل.' },
  { value: 'fawry', label: 'فوري', instructions: 'ادفع عبر كود فوري:\n123456789\nثم أرسل رقم الإيصال.' },
  { value: 'paymob', label: 'Paymob', instructions: 'ستصلك رسالة برابط دفع Paymob. أتم الدفع وأرسل رقم المعاملة.' },
  { value: 'manual', label: 'دفع يدوي / آخر', instructions: 'تواصل مع الإدارة لترتيب طريقة الدفع.' },
];

export default function CheckoutPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingSub, setExistingSub] = useState<{ status: string } | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: string; value: number } | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    if (!courseId || !profile) return;
    const fetch = async () => {
      setLoading(true);
      const [{ data: c }, { data: sub }] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).maybeSingle(),
        supabase.from('subscriptions').select('id, status').eq('student_id', profile.id).eq('course_id', courseId).maybeSingle(),
      ]);
      setCourse(c as Course || null);
      setExistingSub(sub as { status: string } | null);
      setLoading(false);
    };
    fetch();
  }, [courseId, profile]);

  const selectedMethod = PAYMENT_METHODS.find(m => m.value === paymentMethod);
  const basePrice = course?.discount_price && Number(course.discount_price) > 0 ? Number(course.discount_price) : Number(course?.price || 0);
  const finalPrice = Math.max(0, basePrice - couponDiscount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const { data } = await supabase.from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();
      if (!data) {
        setCouponError('الكوبون غير صالح أو غير موجود');
        setCouponDiscount(0);
        setAppliedCoupon(null);
      } else {
        const now = new Date();
        if (data.expires_at && new Date(data.expires_at) < now) {
          setCouponError('انتهت صلاحية هذا الكوبون');
          setCouponDiscount(0);
          setAppliedCoupon(null);
        } else if (data.usage_count >= (data.usage_limit || Infinity)) {
          setCouponError('تجاوز هذا الكوبون الحد الأقصى للاستخدام');
          setCouponDiscount(0);
          setAppliedCoupon(null);
        } else {
          const disc = data.coupon_type === 'percentage'
            ? Math.min((basePrice * data.discount_value) / 100, basePrice)
            : Math.min(data.discount_value, basePrice);
          setCouponDiscount(disc);
          setAppliedCoupon({ code: data.code, type: data.coupon_type, value: data.discount_value });
          toast.success(`تم تطبيق الكوبون "${data.code}" بنجاح!`);
        }
      }
    } catch (err) {
      setCouponError('حدث خطأ أثناء التحقق من الكوبون');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    toast.info('تم إلغاء الكوبون');
  };

  const submitPayment = async () => {
    if (!paymentMethod) { toast.error('يرجى اختيار طريقة الدفع'); return; }
    if (!transactionRef.trim() && !receiptFile) { toast.error('يرجى إدخال رقم المعاملة أو رفع إيصال الدفع'); return; }
    if (!course || !profile) return;
    setSubmitting(true);
    try {
      let receiptUrl: string | null = null;
      if (receiptFile) {
        const ext = receiptFile.name.split('.').pop();
        const path = `receipts/${profile.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('receipts').upload(path, receiptFile, { upsert: false });
        if (uploadError) throw new Error('فشل في رفع الإيصال');
        const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(path);
        receiptUrl = urlData.publicUrl;
      }

      // Insert payment
      const { data: payment, error: payError } = await supabase.from('payments').insert({
        student_id: profile.id,
        course_id: course.id,
        amount: finalPrice,
        original_amount: basePrice,
        payment_method: paymentMethod,
        status: 'pending',
        transaction_ref: transactionRef.trim() || null,
        receipt_url: receiptUrl,
        notes: notes.trim() || null,
      }).select('id').single();

      if (payError) throw payError;

      // Insert subscription
      const { error: subError } = await supabase.from('subscriptions').insert({
        student_id: profile.id,
        course_id: course.id,
        payment_id: payment.id,
        status: 'pending_approval',
      });
      if (subError) throw subError;

      // Update coupon usage
      if (appliedCoupon && couponDiscount > 0) {
        const { data: coupon } = await supabase.from('coupons').select('id, usage_count').eq('code', appliedCoupon.code).maybeSingle();
        if (coupon) await supabase.from('coupons').update({ usage_count: (coupon.usage_count || 0) + 1 }).eq('id', coupon.id);
      }

      // Notify student
      await supabase.from('notifications').insert({
        recipient_id: profile.id,
        title: 'تم استلام طلب الدفع',
        title_ar: 'تم استلام طلب الدفع',
        message: 'تم استلام بيانات الدفع الخاصة بك وهي الآن قيد المراجعة. سنوافيك بنتيجة المراجعة قريباً.',
        message_ar: 'تم استلام بيانات الدفع الخاصة بك وهي الآن قيد المراجعة. سنوافيك بنتيجة المراجعة قريباً.',
        course_id: course.id,
        is_read: false,
      });

      setSuccess(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'حدث خطأ أثناء إرسال الطلب';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48 bg-muted" />
          <Skeleton className="h-48 w-full bg-muted" />
        </div>
      </div>
    );
  }

  if (!course) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">الكورس غير موجود</p>
    </div>
  );

  if (existingSub) {
    const statusMsg: Record<string, { title: string; desc: string; color: string }> = {
      active: { title: 'أنت مشترك بالفعل', desc: 'لديك اشتراك نشط في هذا الكورس.', color: 'text-success' },
      pending_approval: { title: 'طلبك قيد المراجعة', desc: 'تم استلام طلبك وهو قيد مراجعة الإدارة. انتظر الموافقة.', color: 'text-warning' },
    };
    const info = statusMsg[existingSub.status];
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="stat-card max-w-sm w-full text-center">
          <CardContent className="p-8">
            <CheckCircle className={cn('w-12 h-12 mx-auto mb-3', info?.color || 'text-muted-foreground')} />
            <h2 className="text-lg font-bold text-foreground font-cairo mb-2">{info?.title || 'اشتراك موجود'}</h2>
            <p className="text-sm text-muted-foreground mb-4">{info?.desc || 'لديك اشتراك في هذا الكورس.'}</p>
            <Button onClick={() => navigate('/dashboard/courses')} className="w-full">عرض كورساتي</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="stat-card max-w-sm w-full text-center">
          <CardContent className="p-8">
            <CheckCircle className="w-14 h-14 mx-auto mb-3 text-success" />
            <h2 className="text-lg font-bold text-foreground font-cairo mb-2">تم استلام طلبك!</h2>
            <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
              تم استلام بيانات الدفع الخاصة بك وهي الآن قيد المراجعة من الإدارة.
            </p>
            <p className="text-xs text-muted-foreground mb-4">سيتم تفعيل الكورس بعد الموافقة وستصلك إشعار على الفور.</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/dashboard/courses')} className="w-full">عرض كورساتي</Button>
              <Button variant="ghost" onClick={() => navigate('/')} className="w-full border border-border text-foreground hover:bg-accent">الصفحة الرئيسية</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (course.is_free) {
    const handleFreeClaim = async () => {
      if (!profile) return;
      setSubmitting(true);
      const now = new Date();
      const expires = new Date(now);
      expires.setFullYear(expires.getFullYear() + 1);
      await supabase.from('enrollments').upsert({ student_id: profile.id, course_id: course.id, status: 'active' }, { onConflict: 'student_id,course_id' });
      await supabase.from('subscriptions').insert({ student_id: profile.id, course_id: course.id, status: 'active', starts_at: now.toISOString(), expires_at: expires.toISOString() });
      toast.success('تم التسجيل في الكورس المجاني!');
      navigate(`/learn/${course.id}`);
      setSubmitting(false);
    };
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="stat-card max-w-sm w-full text-center">
          <CardContent className="p-8">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-success" />
            <h2 className="text-lg font-bold text-foreground font-cairo mb-2">{course.title_ar}</h2>
            <p className="text-sm text-muted-foreground mb-4">هذا الكورس مجاني! اضغط للتسجيل والبدء فوراً.</p>
            <Button onClick={handleFreeClaim} disabled={submitting} className="w-full">{submitting ? 'جاري التسجيل...' : 'سجّل الآن مجاناً'}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-xl font-bold text-foreground font-cairo">إتمام الاشتراك</h1>

        {/* Course summary */}
        <Card className="stat-card">
          <CardContent className="p-4 flex gap-3">
            <div className="w-20 h-14 rounded-lg bg-secondary overflow-hidden shrink-0">
              {course.cover_image_url ? <img src={course.cover_image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-muted-foreground" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground font-cairo">{course.title_ar}</p>
              {course.discount_price && Number(course.discount_price) > 0 ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-primary font-cairo">{Number(course.discount_price).toLocaleString('ar-EG')} ج.م</span>
                  <span className="text-xs text-muted-foreground line-through">{Number(course.price).toLocaleString('ar-EG')} ج.م</span>
                </div>
              ) : (
                <p className="text-lg font-bold text-primary font-cairo mt-1">{Number(course.price).toLocaleString('ar-EG')} ج.م</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coupon */}
        <Card className="stat-card">
          <CardContent className="p-4">
            <Label className="text-sm font-normal text-muted-foreground mb-2 block">كود الخصم (اختياري)</Label>

            {/* Applied coupon badge */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/8 border border-success/20">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                    <Tag className="w-3.5 h-3.5 text-success" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-success font-cairo">{appliedCoupon.code}</p>
                    <p className="text-xs text-success/80">
                      خصم {appliedCoupon.value}{appliedCoupon.type === 'percentage' ? '%' : ' ج.م'} — وفّرت {couponDiscount.toLocaleString('ar-EG')} ج.م
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-success/70 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                  title="إلغاء الكوبون"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value); if (couponError) setCouponError(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') applyCoupon(); }}
                    placeholder="أدخل رمز الكوبون..."
                    className={cn('bg-input border-border flex-1 uppercase placeholder:normal-case', couponError && 'border-destructive')}
                    disabled={couponLoading}
                  />
                  <Button
                    variant="ghost"
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="border border-border text-foreground hover:bg-accent shrink-0 min-w-[72px]"
                  >
                    {couponLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : 'تطبيق'}
                  </Button>
                </div>
                {couponError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X className="w-3 h-3 shrink-0" />
                    {couponError}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment method */}
        <Card className="stat-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-cairo text-foreground flex items-center gap-2"><CreditCard className="w-4 h-4" />طريقة الدفع</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PAYMENT_METHODS.map(m => (
                <button key={m.value} onClick={() => setPaymentMethod(m.value)}
                  className={cn('p-2.5 rounded-lg border text-xs font-medium transition-all', paymentMethod === m.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground')}>
                  {m.label}
                </button>
              ))}
            </div>

            {selectedMethod && (
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <p className="text-xs font-medium text-foreground mb-1">تعليمات الدفع:</p>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{selectedMethod.instructions}</pre>
              </div>
            )}

            {paymentMethod && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal text-muted-foreground">رقم المعاملة / الإيصال</Label>
                  <Input value={transactionRef} onChange={e => setTransactionRef(e.target.value)} placeholder="أدخل رقم المعاملة..." className="bg-input border-border" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-normal text-muted-foreground">رفع صورة الإيصال (اختياري)</Label>
                  <div className="flex items-center gap-2">
                    <label className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs transition-colors', receiptFile ? 'border-success text-success' : 'border-border text-muted-foreground hover:border-primary/50')}>
                      <Upload className="w-3.5 h-3.5" />
                      {receiptFile ? receiptFile.name : 'اختر صورة...'}
                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={e => setReceiptFile(e.target.files?.[0] || null)} />
                    </label>
                    {receiptFile && <button onClick={() => setReceiptFile(null)} className="text-xs text-muted-foreground hover:text-destructive">إلغاء</button>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">PNG, JPG, PDF — الحد الأقصى 5MB</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-normal text-muted-foreground">ملاحظات إضافية (اختياري)</Label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="bg-input border-border resize-none" rows={2} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary + submit */}
        <Card className="stat-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">سعر الكورس</span>
              <span className="text-sm text-foreground">{basePrice.toLocaleString('ar-EG')} ج.م</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">خصم الكوبون</span>
                <span className="text-sm text-success">- {couponDiscount.toLocaleString('ar-EG')} ج.م</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">المبلغ النهائي</span>
              <span className="text-lg font-bold text-primary font-cairo">{finalPrice.toLocaleString('ar-EG')} ج.م</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
          <p>بعد إرسال الطلب، سيقوم فريقنا بمراجعة بيانات الدفع وتفعيل الكورس خلال 24 ساعة.</p>
        </div>

        <Button onClick={submitPayment} disabled={submitting || !paymentMethod} size="lg" className="w-full">
          {submitting ? 'جاري الإرسال...' : `إرسال طلب الاشتراك — ${finalPrice.toLocaleString('ar-EG')} ج.م`}
        </Button>
      </div>
    </div>
  );
}



