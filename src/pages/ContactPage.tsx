import { useState, FormEvent } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import PublicLayout from '@/components/layouts/PublicLayout';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: form.subject.trim() || null,
        message: form.message.trim(),
      });
      if (error) throw error;
      toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error('ContactPage submit error:', err);
      toast.error('حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">تواصل معنا</h1>
          <p className="text-muted-foreground text-sm">نحن هنا للإجابة على جميع استفساراتك</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Mail className="h-4.5 w-4.5 text-primary" />
              </div>
              <h3 className="text-foreground font-medium text-sm mb-1">البريد الإلكتروني</h3>
              <p className="text-muted-foreground text-xs">info@gais.academy</p>
              <p className="text-muted-foreground text-xs">support@gais.academy</p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Phone className="h-4.5 w-4.5 text-primary" />
              </div>
              <h3 className="text-foreground font-medium text-sm mb-1">الهاتف / واتساب</h3>
              <p className="text-muted-foreground text-xs ltr-number">+20 100 000 0000</p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <MapPin className="h-4.5 w-4.5 text-primary" />
              </div>
              <h3 className="text-foreground font-medium text-sm mb-1">العنوان</h3>
              <p className="text-muted-foreground text-xs">القاهرة، جمهورية مصر العربية</p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-border bg-card space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-normal">الاسم *</Label>
                  <Input
                    id="name"
                    placeholder="اسمك الكامل"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-normal">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="bg-background border-border"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-normal">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+20 100 000 0000"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="bg-background border-border"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-sm font-normal">الموضوع</Label>
                  <Input
                    id="subject"
                    placeholder="موضوع رسالتك"
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-sm font-normal">الرسالة *</Label>
                <Textarea
                  id="message"
                  placeholder="اكتب رسالتك هنا..."
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="bg-background border-border resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    جاري الإرسال...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    إرسال الرسالة
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

