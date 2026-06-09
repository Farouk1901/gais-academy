import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { translateAuthError } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Redirect back to the page the user tried to visit, or dashboard by default
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { toast.error('يرجى تعبئة جميع الحقول'); return; }
    setLoading(true);
    const { error, role } = await signIn(email.trim(), password);
    if (error) {
      setLoading(false);
      toast.error(translateAuthError(error.message));
    } else {
      toast.success('مرحباً بك!');
      // Redirect admins/super_admins to admin panel; everyone else to `from`
      const isAdminRole = role === 'admin' || role === 'super_admin';
      const destination = isAdminRole
        ? (from.startsWith('/admin') ? from : '/admin')
        : from;
      navigate(destination, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left decorative panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-card border-e border-border p-10 relative overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 ai-grid-bg opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60 pointer-events-none" />
        {/* Glow */}
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

        <div className="relative z-10 space-y-5">
          {[
            { num: '12,000+', label: 'طالب مسجّل' },
            { num: '48+',     label: 'كورس متاح'  },
            { num: '5,200+',  label: 'شهادة مُصدَرة' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-0.5 h-8 bg-primary/40 rounded-full" />
              <div>
                <p className="text-foreground font-bold text-lg font-inter ltr-number">{s.num}</p>
                <p className="text-muted-foreground text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-muted-foreground text-xs leading-relaxed text-pretty">
          "أفضل منصة عربية لتعلم الذكاء الاصطناعي. المحتوى احترافي والشرح واضح جداً."
          <br />
          <span className="text-foreground font-medium mt-1 block">— أحمد محمد، مهندس برمجيات</span>
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
            <h1 className="font-heading text-2xl font-bold text-foreground">تسجيل الدخول</h1>
            <p className="text-muted-foreground text-sm mt-1.5">مرحباً بك، أدخل بياناتك للمتابعة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-normal text-muted-foreground">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-card border-border h-11 px-3 font-inter"
                dir="ltr"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-normal text-muted-foreground">كلمة المرور</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-card border-border h-11 px-3 pe-10 font-inter"
                  dir="ltr"
                  autoComplete="current-password"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_28px_rgba(59,130,246,0.4)] transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  جاري الدخول...
                </span>
              ) : 'تسجيل الدخول'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="divider-fade" />
          </div>

          <p className="text-center text-muted-foreground text-sm">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              إنشاء حساب مجاناً
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-4">
            بتسجيل الدخول، أنت توافق على{' '}
            <Link to="/terms" className="underline hover:text-foreground transition-colors">شروط الاستخدام</Link>
            {' '}و{' '}
            <Link to="/privacy" className="underline hover:text-foreground transition-colors">سياسة الخصوصية</Link>
          </p>
        </div>
      </div>
    </div>
  );
}


