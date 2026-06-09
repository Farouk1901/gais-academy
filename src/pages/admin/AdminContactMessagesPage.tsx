import { useEffect, useState } from 'react';
import { supabase } from '@/db/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Mail, MailOpen, Trash2, Search, MessageSquare,
  Phone, AtSign, Clock, Filter, RefreshCw,
} from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { cn } from '@/lib/utils';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

type FilterType = 'all' | 'unread' | 'read';

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMessages(Array.isArray(data) ? (data as ContactMessage[]) : []);
    } catch (err) {
      console.error('AdminContactMessagesPage fetch error:', err);
      toast.error('تعذّر جلب رسائل التواصل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Filtered + searched list
  const displayed = messages.filter(m => {
    const matchFilter =
      filter === 'all' ||
      (filter === 'unread' && !m.is_read) ||
      (filter === 'read' && m.is_read);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q) ||
      (m.phone || '').includes(q);
    return matchFilter && matchSearch;
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  const toggleRead = async (msg: ContactMessage) => {
    setTogglingId(msg.id);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: !msg.is_read })
        .eq('id', msg.id);
      if (error) throw error;
      setMessages(prev =>
        prev.map(m => (m.id === msg.id ? { ...m, is_read: !m.is_read } : m))
      );
      if (selected?.id === msg.id) setSelected(s => s ? { ...s, is_read: !s.is_read } : null);
      toast.success(msg.is_read ? 'تم تحديدها كغير مقروءة' : 'تم تحديدها كمقروءة');
    } catch (err) {
      console.error('toggleRead error:', err);
      toast.error('تعذّر تحديث حالة الرسالة');
    } finally {
      setTogglingId(null);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success('تم حذف الرسالة');
    } catch (err) {
      console.error('deleteMessage error:', err);
      toast.error('تعذّر حذف الرسالة');
    }
  };

  const openMessage = async (msg: ContactMessage) => {
    setSelected(msg);
    // Mark as read automatically on open
    if (!msg.is_read) {
      await toggleRead(msg);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(d);
  };

  const FILTERS: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'الكل' },
    { value: 'unread', label: 'غير مقروء' },
    { value: 'read', label: 'مقروء' },
  ];

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-5" dir="rtl">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-foreground font-cairo flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              رسائل التواصل
              {unreadCount > 0 && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  {unreadCount} غير مقروء
                </Badge>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              رسائل الزوار من صفحة تواصل معنا
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchMessages}
            className="border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <RefreshCw className="w-4 h-4 ml-1.5" />
            تحديث
          </Button>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          {/* Filter tabs */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden shrink-0">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  filter === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {f.label}
                {f.value === 'unread' && unreadCount > 0 && (
                  <span className="mr-1 text-[10px] font-bold">({unreadCount})</span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-xs">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو البريد أو الموضوع..."
              className="pr-8 text-sm h-8 bg-input border-border"
            />
          </div>

          <p className="text-xs text-muted-foreground shrink-0 mr-auto">
            {displayed.length} رسالة
          </p>
        </div>

        {/* Messages Table */}
        <Card className="stat-card">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-muted" />
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {filter !== 'all' ? 'لا توجد رسائل في هذا التصفية' : 'لا توجد رسائل بعد'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">الحالة</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">الاسم</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap hidden md:table-cell">البريد / الهاتف</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">الموضوع</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap hidden lg:table-cell">التاريخ</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map(msg => (
                      <tr
                        key={msg.id}
                        onClick={() => openMessage(msg)}
                        className={cn(
                          'border-b border-border/50 cursor-pointer transition-colors hover:bg-accent/30',
                          !msg.is_read && 'bg-primary/3'
                        )}
                      >
                        {/* Read status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {msg.is_read ? (
                            <MailOpen className="w-4 h-4 text-muted-foreground/50" />
                          ) : (
                            <Mail className="w-4 h-4 text-primary" />
                          )}
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className={cn('text-sm truncate max-w-[120px]', !msg.is_read && 'font-semibold text-foreground')}>
                            {msg.name}
                          </p>
                        </td>

                        {/* Email / Phone */}
                        <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <AtSign className="w-3 h-3 shrink-0" />
                              {msg.email}
                            </span>
                            {msg.phone && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3 shrink-0" />
                                {msg.phone}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className={cn('text-xs truncate max-w-[180px]', !msg.is_read ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                            {msg.subject}
                          </p>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 hidden lg:table-cell whitespace-nowrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            {formatDate(msg.created_at)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td
                          className="px-4 py-3 whitespace-nowrap"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1">
                            {/* Toggle read */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              onClick={() => toggleRead(msg)}
                              disabled={togglingId === msg.id}
                              title={msg.is_read ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                            >
                              {msg.is_read
                                ? <Mail className="w-3.5 h-3.5" />
                                : <MailOpen className="w-3.5 h-3.5" />}
                            </Button>

                            {/* Delete */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  title="حذف الرسالة"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-cairo">حذف الرسالة</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف رسالة "{msg.subject}" من {msg.name}؟ لا يمكن التراجع عن هذا الإجراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-row-reverse gap-2">
                                  <AlertDialogAction
                                    onClick={() => deleteMessage(msg.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    حذف
                                  </AlertDialogAction>
                                  <AlertDialogCancel className="border border-border text-foreground hover:bg-accent">
                                    إلغاء
                                  </AlertDialogCancel>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Detail Dialog */}
        <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg" dir="rtl">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-cairo text-base flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                    {selected.subject}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-1">
                  {/* Sender info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary text-xs font-bold">
                          {selected.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">المُرسِل</p>
                        <p className="text-sm font-medium text-foreground truncate">{selected.name}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-muted/40 border border-border">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <AtSign className="w-3 h-3 shrink-0" />
                        <span className="truncate">{selected.email}</span>
                      </span>
                      {selected.phone && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3 shrink-0" />
                          {selected.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 shrink-0" />
                    {formatDate(selected.created_at)}
                  </p>

                  {/* Message body */}
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <p className="text-xs text-muted-foreground mb-1.5 font-medium">نص الرسالة</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRead(selected)}
                      disabled={togglingId === selected.id}
                      className="border border-border text-muted-foreground hover:text-foreground hover:bg-accent text-xs h-8"
                    >
                      {selected.is_read ? (
                        <><Mail className="w-3.5 h-3.5 ml-1.5" />تحديد كغير مقروء</>
                      ) : (
                        <><MailOpen className="w-3.5 h-3.5 ml-1.5" />تحديد كمقروء</>
                      )}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 text-xs h-8"
                        >
                          <Trash2 className="w-3.5 h-3.5 ml-1.5" />
                          حذف
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-cairo">حذف الرسالة</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse gap-2">
                          <AlertDialogAction
                            onClick={() => deleteMessage(selected.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            حذف
                          </AlertDialogAction>
                          <AlertDialogCancel className="border border-border text-foreground hover:bg-accent">
                            إلغاء
                          </AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}

