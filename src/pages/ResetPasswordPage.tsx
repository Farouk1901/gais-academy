import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase sends tokens via hash fragment on password reset link
    const hash = window.location.hash;
    if (hash.includes('access_token') || searchParams.get('type') === 'recovery') {
      setReady(true);
    } else {
      // Try to detect active session from Supabase hash handling
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setReady(true);
        else {
          toast.error('رابط إعادة التعيين غير صالح أو منتهي الصلاحية');
          navigate('/forgot-password');
        }
      });
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success('تم تحديث كلمة المرور بنجاح');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      console.error('updateUser password error:', err);
      toast.error('حدث خطأ أثناء تحديث كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold font-montserrat">G</span>
            </div>
            <div className="text-right">
              <div className="text-foreground font-semibold text-sm">أكاديمية الجوهري</div>
              <div className="text-muted-foreground text-xs font-montserrat">GAIS</div>
            </div>
          </div>
        </div>

        {done ? (
          <div className="text-center p-8 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">تم تحديث كلمة المرور!</h2>
            <p className="text-muted-foreground text-sm">
              جاري تحويلك لصفحة تسجيل الدخول...
            </p>
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground">إعادة تعيين كلمة المرور</h1>
                <p className="text-muted-foreground text-xs mt-0.5">أدخل كلمة المرور الجديدة</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-normal">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="6 أحرف على الأقل"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-background border-border pr-4 pl-10"
                    required
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-normal">تأكيد كلمة المرور</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="أعد إدخال كلمة المرور"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="bg-background border-border"
                  required
                  dir="ltr"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                    جاري الحفظ...
                  </div>
                ) : 'تحديث كلمة المرور'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

