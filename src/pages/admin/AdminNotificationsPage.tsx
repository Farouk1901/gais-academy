import { useState, FormEvent } from 'react';
import { Bell, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({
    title_ar: '', message_ar: '',
    recipient: 'all',
  });
  const [sending, setSending] = useState(false);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title_ar || !form.message_ar) { toast.error('يرجى تعبئة جميع الحقول'); return; }
    setSending(true);
    try {
      if (form.recipient === 'all') {
        const { data: profiles, error: fetchErr } = await supabase.from('profiles').select('id').eq('role', 'user');
        if (fetchErr) throw fetchErr;
        const notifs = (profiles || []).map((p: { id: string }) => ({
          recipient_id: p.id,
          title_ar: form.title_ar,
          title: form.title_ar,
          message_ar: form.message_ar,
          message: form.message_ar,
          is_read: false,
        }));
        if (notifs.length > 0) {
          const { error: insertErr } = await supabase.from('notifications').insert(notifs);
          if (insertErr) throw insertErr;
        }
      } else {
        const { error: insertErr } = await supabase.from('notifications').insert({
          recipient_id: null,
          title_ar: form.title_ar,
          title: form.title_ar,
          message_ar: form.message_ar,
          message: form.message_ar,
          is_read: false,
        });
        if (insertErr) throw insertErr;
      }
      toast.success('تم إرسال الإشعار بنجاح!');
      setForm({ title_ar: '', message_ar: '', recipient: 'all' });
    } catch (err) {
      console.error('handleSend notifications error:', err);
      toast.error('حدث خطأ أثناء إرسال الإشعار');
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">إرسال الإشعارات</h1>
        <p className="text-muted-foreground text-sm mt-1">إرسال إشعارات للطلاب</p>
      </div>

      <div className="max-w-xl">
        <form onSubmit={handleSend} className="p-5 rounded-xl border border-border bg-card space-y-4">
          <div className="space-y-1.5">
              <Label className="text-sm font-normal">المستلمون</Label>
              <Select value={form.recipient} onValueChange={v => setForm(p => ({ ...p, recipient: v }))}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" />جميع الطلاب</span>
                  </SelectItem>
                  <SelectItem value="broadcast">إشعار عام</SelectItem>
                </SelectContent>
              </Select>
            </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-normal">عنوان الإشعار *</Label>
            <Input
              placeholder="عنوان الإشعار"
              value={form.title_ar}
              onChange={e => setForm(p => ({ ...p, title_ar: e.target.value }))}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-normal">نص الإشعار *</Label>
            <Textarea
              placeholder="محتوى الإشعار..."
              rows={5}
              value={form.message_ar}
              onChange={e => setForm(p => ({ ...p, message_ar: e.target.value }))}
              className="bg-background border-border resize-none"
            />
          </div>

          {/* Preview */}
          {(form.title_ar || form.message_ar) && (
            <div className="p-4 rounded-lg border border-border bg-background">
              <p className="text-xs text-muted-foreground mb-2">معاينة الإشعار</p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bell className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-medium">{form.title_ar || 'العنوان'}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{form.message_ar || 'النص'}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={sending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            {sending ? 'جاري الإرسال...' : (
              <><Send className="h-4 w-4" />إرسال الإشعار</>
            )}
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}

