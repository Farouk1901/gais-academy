import { useEffect, useState } from 'react';
import { HeadphonesIcon, MessageSquare, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import type { SupportTicket } from '@/types/types';
import { useAuth } from '@/contexts/AuthContext';

const statusConfig: Record<string, { label: string; class: string }> = {
  open: { label: 'مفتوح', class: 'text-primary bg-primary/10 border-primary/30' },
  pending: { label: 'معلق', class: 'text-warning bg-warning/10 border-warning/30' },
  closed: { label: 'مغلق', class: 'text-muted-foreground bg-muted border-border' },
};

export default function AdminSupportPage() {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filter, setFilter] = useState('open');
  const [loading, setLoading] = useState(true);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<Record<string, boolean>>({});

  const fetchTickets = async () => {
    setLoading(true);
    try {
    let q = supabase
      .from('support_tickets')
      .select('*, profiles!student_id(full_name, email), ticket_replies(id, message, created_at, profiles!author_id(full_name, role))')
      .order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setTickets(Array.isArray(data) ? (data as SupportTicket[]) : []);
    } catch (err) {
      console.error('AdminSupportPage.tsx fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [filter]);

  const updateStatus = async (ticketId: string, status: string) => {
    await supabase.from('support_tickets').update({ status }).eq('id', ticketId);
    fetchTickets();
    toast.success('تم تحديث حالة التذكرة');
  };

  const sendReply = async (ticket: SupportTicket) => {
    const text = replyTexts[ticket.id];
    if (!text?.trim()) { toast.error('يرجى كتابة رد'); return; }
    setSending(p => ({ ...p, [ticket.id]: true }));
    const { error } = await supabase.from('ticket_replies').insert({
      ticket_id: ticket.id,
      author_id: profile!.id,
      message: text.trim(),
    });
    setSending(p => ({ ...p, [ticket.id]: false }));
    if (!error) {
      toast.success('تم إرسال الرد');
      setReplyTexts(p => ({ ...p, [ticket.id]: '' }));
      // Update status to pending if open
      if (ticket.status === 'open') {
        await supabase.from('support_tickets').update({ status: 'pending' }).eq('id', ticket.id);
      }
      fetchTickets();
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">الدعم الفني</h1>
          <p className="text-muted-foreground text-sm mt-1">{tickets.length} تذكرة</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="open">مفتوح</SelectItem>
            <SelectItem value="pending">معلق</SelectItem>
            <SelectItem value="closed">مغلق</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card">
          <HeadphonesIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground font-semibold mb-2">لا توجد تذاكر</h3>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {tickets.map(ticket => {
            const sc = statusConfig[ticket.status] || statusConfig.open;
            const user = ticket.profiles as unknown as { full_name?: string; email?: string };
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-foreground text-sm font-medium">{ticket.subject}</p>
                      </div>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {user?.full_name || 'طالب'} · {user?.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={`text-xs ${sc.class}`}>{sc.label}</Badge>
                      <span className="text-muted-foreground text-xs ltr-number">
                        {new Date(ticket.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-3">
                    {/* Original message */}
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-foreground text-xs font-medium mb-1">رسالة الطالب</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">{ticket.message}</p>
                    </div>
                    {/* Replies */}
                    {Array.isArray(replies) && replies.map((reply: unknown) => {
                      const r = reply as { id: string; message: string; created_at: string; profiles?: { full_name: string; role: string } };
                      const isAdmin = r.profiles?.role === 'admin';
                      return (
                        <div key={r.id} className={`p-3 rounded-lg ${isAdmin ? 'bg-primary/5 border border-primary/10' : 'bg-muted/30'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-foreground">
                              {isAdmin ? '🛡️ الدعم الفني' : (r.profiles?.full_name || 'الطالب')}
                            </span>
                            <span className="text-muted-foreground text-xs ltr-number">
                              {new Date(r.created_at).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm">{r.message}</p>
                        </div>
                      );
                    })}

                    {/* Reply box */}
                    {ticket.status !== 'closed' && (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="اكتب ردك هنا..."
                          rows={3}
                          value={replyTexts[ticket.id] || ''}
                          onChange={e => setReplyTexts(p => ({ ...p, [ticket.id]: e.target.value }))}
                          className="bg-background border-border resize-none text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => sendReply(ticket)}
                            disabled={sending[ticket.id]}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs"
                          >
                            {sending[ticket.id] ? 'جاري الإرسال...' : (
                              <><MessageSquare className="h-3.5 w-3.5 ms-1" />إرسال الرد</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(ticket.id, 'closed')}
                            className="h-8 text-xs flex items-center gap-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            إغلاق التذكرة
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </AdminLayout>
  );
}
