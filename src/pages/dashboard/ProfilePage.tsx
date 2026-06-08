import { useEffect, useState, FormEvent } from 'react';
import { Eye, EyeOff, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: form.fullName, phone: form.phone || null })
        .eq('id', profile.id);
      if (error) throw error;
      toast.success('تم تحديث البيانات بنجاح!');
      await refreshProfile();
    } catch (err) {
      console.error('handleSaveProfile error:', err);
      toast.error('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!passwords.newPass || !passwords.confirm) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }
    if (passwords.newPass.length < 6) {
      toast.error('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }
    setSavingPass(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.newPass });
      if (error) throw error;
      toast.success('تم تغيير كلمة المرور بنجاح!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      console.error('handleChangePassword error:', err);
      toast.error('حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">إعدادات الحساب</h1>
        <p className="text-muted-foreground text-sm mt-1">تحديث بيانات حسابك الشخصي</p>
      </div>

      <div className="max-w-xl space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-xl">
              {profile?.full_name?.charAt(0) || 'م'}
            </span>
          </div>
          <div>
            <p className="text-foreground font-semibold">{profile?.full_name || 'مستخدم'}</p>
            <p className="text-muted-foreground text-xs">{profile?.email}</p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="h-4 w-4" />
            البيانات الشخصية
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">الاسم الكامل</Label>
              <Input
                value={form.fullName}
                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">البريد الإلكتروني</Label>
              <Input
                value={form.email}
                disabled
                className="bg-muted border-border cursor-not-allowed"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">لا يمكن تغيير البريد الإلكتروني</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">رقم الهاتف</Label>
              <Input
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="01XXXXXXXXX"
                className="bg-background border-border"
                dir="ltr"
              />
            </div>
            <Button
              type="submit"
              disabled={savingProfile}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
            >
              {savingProfile ? 'جاري الحفظ...' : (
                <><Save className="h-3.5 w-3.5" /> حفظ التغييرات</>
              )}
            </Button>
          </form>
        </div>

        {/* Password */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <h2 className="text-base font-semibold text-foreground mb-4">تغيير كلمة المرور</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  placeholder="6 أحرف على الأقل"
                  value={passwords.newPass}
                  onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                  className="bg-background border-border pe-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute top-1/2 end-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">تأكيد كلمة المرور الجديدة</Label>
              <Input
                type="password"
                placeholder="أعد كتابة كلمة المرور"
                value={passwords.confirm}
                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className="bg-background border-border"
                dir="ltr"
              />
            </div>
            <Button
              type="submit"
              disabled={savingPass}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {savingPass ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
