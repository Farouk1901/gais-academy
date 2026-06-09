import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import type { Notification } from '@/types/types';

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .or(`recipient_id.eq.${profile.id},recipient_id.is.null`)
          .order('created_at', { ascending: false })
          .limit(30);
        if (error) throw error;
        setNotifs(Array.isArray(data) ? (data as Notification[]) : []);
      } catch (err) {
        console.error('NotificationsPage fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [profile?.id]);

  const markAllRead = async () => {
    if (!profile?.id) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', profile.id)
      .eq('is_read', false);
    setNotifs(p => p.map(n => ({ ...n, is_read: true })));
  };

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">الإشعارات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unread > 0 ? `${unread} إشعارات غير مقروءة` : 'جميع الإشعارات مقروءة'}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />
            تعليم الكل كمقروء
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground font-semibold mb-2">لا توجد إشعارات</h3>
          <p className="text-muted-foreground text-sm">ستظهر هنا إشعاراتك الجديدة</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                !n.is_read ? 'border-primary/20 bg-primary/5' : 'border-border bg-card'
              }`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-primary' : 'bg-muted'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium">{n.title_ar || n.title}</p>
                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{n.message_ar || n.message}</p>
                <p className="text-muted-foreground text-xs mt-1.5 ltr-number">
                  {new Date(n.created_at).toLocaleDateString('ar-EG')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

