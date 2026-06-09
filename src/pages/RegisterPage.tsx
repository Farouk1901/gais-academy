import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { translateAuthError } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) { toast.error('يرجى تعبئة جميع الحقول'); return; }
    if (form.password.length < 6) { toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    if (form.password !== form.confirmPassword) { toast.error('كلمتا المرور غير متطابقتين'); return; }
    if (!agreed) { toast.error('يجب الموافقة على شروط الاستخدام وسياسة الخصوصية'); return; }
    setLoading(true);
    const { error } = await signUp(form.email.trim(), form.password, form.fullName.trim());
    if (error) {
      setLoading(false);
      toast.error(translateAuthError(error.message));
    } else {
      toast.success('تم إنشاء حسابك بنجاح! مرحباً بك في GAIS');
      navigate('/dashboard');
    }
  };

  const features = [
    'وصول فوري لجميع الكورسات المشتراة',
    'تتبع تقدمك خطوة بخطوة',
    'شهادات إتمام موثّقة بـ QR',
    'دعم فني متخصص على مدار الساعة',
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left decorative panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-card border-e border-border p-10 relative overflow-hidden">
        <div className="absolute inset-0 ai-grid-bg opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60 pointer-events-none" />
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
              <span className="text-primary font-bold font-inter">G</span>
            </div>
            <div>
              <p className="text-foreground font-semibold text-sm font-heading">أكاديمية الجوهري</p>
              <p className="text-muted-foreground text-[10px] font-inter uppercase tracking-wider">GAIS · AI School</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-4">
          <p className="text-foreground font-heading font-semibold text-base mb-2">ماذا ستحصل عليه؟</p>
          {features.map(f => (
            <div key={f} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <p className="text-muted-foreground text-sm leading-relaxed">{f}</p>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-muted-foreground text-xs leading-relaxed">
          انضم لأكثر من{' '}
          <span className="text-foreground font-medium font-inter">12,000</span>{' '}
          طالب يتعلمون الذكاء الاصطناعي مع أكاديمية الجوهري GAIS.
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
              <span className="text-primary font-bold font-inter">G</span>
            </div>
            <span className="text-foreground font-semibold font-heading">أكاديمية الجوهري</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-foreground">إنشاء حساب جديد</h1>
            <p className="text-muted-foreground text-sm mt-1.5">ابدأ رحلتك التعليمية في الذكاء الاصطناعي</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-normal text-muted-foreground">الاسم الكامل</Label>
              <Input
                id="fullName"
                placeholder="محمد أحمد"
                value={form.fullName}
                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                className="bg-card border-border h-11 px-3"
                autoComplete="name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-normal text-muted-foreground">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="bg-card border-border h-11 px-3 font-inter"
                dir="ltr"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-normal text-muted-foreground">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="6 أحرف على الأقل"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="bg-card border-border h-11 px-3 pe-10 font-inter"
                  dir="ltr"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute top-1/2 end-3 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-normal text-muted-foreground">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="أعد كتابة كلمة المرور"
                value={form.confirmPassword}
                onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                className="bg-card border-border h-11 px-3 font-inter"
                dir="ltr"
                autoComplete="new-password"
              />
            </div>

            <div className="flex items-start gap-2.5 py-1">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={v => setAgreed(!!v)}
                className="mt-0.5 shrink-0"
              />
              <Label htmlFor="terms" className="text-xs text-muted-foreground font-normal leading-relaxed cursor-pointer">
                أوافق على{' '}
                <Link to="/terms" className="text-primary hover:underline">شروط الاستخدام</Link>
                {' '}و{' '}
                <Link to="/privacy" className="text-primary hover:underline">سياسة الخصوصية</Link>
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_28px_rgba(59,130,246,0.4)] transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  جاري إنشاء الحساب...
                </span>
              ) : 'إنشاء الحساب'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="divider-fade" />
          </div>

          <p className="text-center text-muted-foreground text-sm">
            لديك حساب؟{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


