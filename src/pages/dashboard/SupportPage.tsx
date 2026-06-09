import { useEffect, useState, FormEvent } from 'react';
import { HeadphonesIcon, Plus, Send, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@/components/ui/accordion';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import type { SupportTicket } from '@/types/types';

const statusConfig: Record<string, { label: string; class: string }> = {
  open: { label: 'مفتوح', class: 'text-primary bg-primary/10 border-primary/30' },
  pending: { label: 'معلق', class: 'text-warning bg-warning/10 border-warning/30' },
  closed: { label: 'مغلق', class: 'text-muted-foreground bg-muted border-border' },
};

export default function SupportPage() {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, ticket_replies(id, message, created_at, profiles!author_id(full_name, role))')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTickets(Array.isArray(data) ? (data as SupportTicket[]) : []);
    } catch (err) {
      console.error('SupportPage fetchTickets error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [profile?.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.message) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({
        student_id: profile!.id,
        subject: form.subject,
        message: form.message,
        status: 'open',
      });
      if (error) throw error;
      toast.success('تم إرسال تذكرة الدعم بنجاح!');
      setForm({ subject: '', message: '' });
      setOpen(false);
      fetchTickets();
    } catch (err) {
      console.error('handleSubmit support error:', err);
      toast.error('حدث خطأ أثناء إرسال التذكرة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">الدعم الفني</h1>
          <p className="text-muted-foreground text-sm mt-1">تواصل مع فريق الدعم</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              تذكرة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
            <DialogHeader>
              <DialogTitle>إرسال تذكرة دعم</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-normal">الموضوع *</Label>
                <Input
                  placeholder="وصف مختصر للمشكلة"
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-normal">الرسالة *</Label>
                <Textarea
                  placeholder="اشرح مشكلتك بالتفصيل..."
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="bg-background border-border resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {submitting ? 'جاري الإرسال...' : (
                  <span className="flex items-center gap-2"><Send className="h-4 w-4" /> إرسال التذكرة</span>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card">
          <HeadphonesIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground font-semibold mb-2">لا توجد تذاكر دعم</h3>
          <p className="text-muted-foreground text-sm">اضغط على "تذكرة جديدة" إذا كنت بحاجة للمساعدة</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {tickets.map(ticket => {
            const sc = statusConfig[ticket.status] || statusConfig.open;
            const replies = ticket.ticket_replies || [];
            return (
              <AccordionItem
                key={ticket.id}
                value={ticket.id}
                className="border border-border rounded-xl bg-card px-4"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 flex-1 text-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm font-medium truncate">{ticket.subject}</p>
                      <p className="text-muted-foreground text-xs mt-0.5 ltr-number">
                        {new Date(ticket.created_at).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={`text-xs ${sc.class}`}>
                        {sc.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {replies.length} رد
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-3">
                    {/* Original message */}
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-foreground text-xs font-medium mb-1">رسالتك</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">{ticket.message}</p>
                    </div>
                    {/* Replies */}
                    {Array.isArray(replies) && replies.map((reply: unknown) => {
                      const r = reply as {
                        id: string; message: string; created_at: string;
                        profiles?: { full_name: string; role: string };
                      };
                      const isAdmin = r.profiles?.role === 'admin';
                      return (
                        <div key={r.id} className={`p-3 rounded-lg ${isAdmin ? 'bg-primary/5 border border-primary/10' : 'bg-muted/30'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-foreground">
                              {isAdmin ? '🛡️ فريق الدعم' : (r.profiles?.full_name || 'أنت')}
                            </span>
                            <span className="text-muted-foreground text-xs ltr-number">
                              {new Date(r.created_at).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">{r.message}</p>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </DashboardLayout>
  );
}

