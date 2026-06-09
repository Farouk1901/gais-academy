import { useEffect, useState, useCallback, ComponentType } from 'react';
import { supabase } from '@/db/supabase';
import { useAuth, logActivity } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Search, UserPlus, Edit, Trash2, RefreshCw, Shield, Crown, GraduationCap, User } from 'lucide-react';
import type { Profile, UserRole } from '@/types/types';
import AdminLayout from '@/components/layouts/AdminLayout';

const ROLE_LABELS: Record<string, string> = { super_admin: 'Super Admin', admin: 'مدير', instructor: 'محاضر', user: 'طالب' };
const ROLE_CLASS: Record<string, string> = {
  super_admin: 'bg-warning/10 text-warning border-warning/20',
  admin: 'bg-primary/10 text-primary border-primary/20',
  instructor: 'bg-info/10 text-info border-info/20',
  user: 'bg-muted text-muted-foreground border-border',
};
const ROLE_ICON: Record<string, ComponentType<{ className?: string }>> = {
  super_admin: Crown, admin: Shield, instructor: User, user: GraduationCap,
};

export default function AdminUsersPage() {
  const { profile: myProfile, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState<Profile | null>(null);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | 'create' | null>(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', role: 'user' as UserRole, is_active: true });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (roleFilter !== 'all') query = query.eq('role', roleFilter);
    const { data, error } = await query;
    if (error) toast.error('خطأ في تحميل المستخدمين');
    else setUsers(data || []);
    } catch (err) {
      console.error('AdminUsersPage.tsx fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.phone || '').toLowerCase().includes(q);
  });

  const openEdit = (u: Profile) => {
    setSelected(u);
    setFormData({ full_name: u.full_name || '', email: u.email || '', phone: u.phone || '', role: u.role, is_active: u.is_active });
    setDialogType('edit');
  };

  const saveUser = async () => {
    if (!selected || !myProfile) return;
    // Only super_admin can assign super_admin or admin roles
    if ((formData.role === 'super_admin' || formData.role === 'admin') && !isSuperAdmin) {
      toast.error('فقط Super Admin يمكنه تعيين هذا الدور');
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ full_name: formData.full_name, phone: formData.phone || null, role: formData.role, is_active: formData.is_active }).eq('id', selected.id);
      if (error) throw error;
      try { await logActivity(myProfile.id, 'edit_user', 'user', selected.id, { role: formData.role }); } catch (_) { /* non-critical */ }
      toast.success('تم تحديث المستخدم');
      setDialogType(null);
      fetchUsers();
    } catch (err) {
      console.error('saveUser error:', err);
      toast.error('فشل في تحديث المستخدم');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!selected || !myProfile) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ is_active: false }).eq('id', selected.id);
      if (error) throw error;
      try { await logActivity(myProfile.id, 'deactivate_user', 'user', selected.id); } catch (_) { /* non-critical */ }
      toast.success('تم تعطيل الحساب');
      setDialogType(null);
      fetchUsers();
    } catch (err) {
      console.error('deleteUser error:', err);
      toast.error('فشل في تعطيل المستخدم');
    } finally {
      setActionLoading(false);
    }
  };

  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('ar-EG') : '—';

  return (
    <AdminLayout>
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground font-cairo">إدارة المستخدمين</h2>
          <p className="text-sm text-muted-foreground">إدارة حسابات جميع المستخدمين</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={fetchUsers} className="border border-border text-foreground hover:bg-accent"><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>
      <Card className="stat-card"><CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="ابحث بالاسم أو البريد أو الهاتف..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9 bg-input border-border" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-40 bg-input border-border"><SelectValue placeholder="الدور" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأدوار</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">مدير</SelectItem>
              <SelectItem value="instructor">محاضر</SelectItem>
              <SelectItem value="user">طالب</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>
      <Card className="stat-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold font-cairo">المستخدمون ({loading ? '...' : filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="w-full max-w-full overflow-x-auto bg-card rounded-b-lg">
            <table className="w-full min-w-max">
              <thead><tr className="border-b border-border">
                {['الاسم', 'البريد / الهاتف', 'الدور', 'الحالة', 'تاريخ التسجيل', 'إجراءات'].map(h => (
                  <th key={h} className="text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {loading ? [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50">{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24 bg-muted" /></td>)}</tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-sm text-muted-foreground py-12">لا يوجد مستخدمون</td></tr>
                ) : filtered.map(u => {
                  const RoleIcon = ROLE_ICON[u.role] || User;
                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-primary">{(u.full_name || 'U')[0].toUpperCase()}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground whitespace-nowrap">{u.full_name || 'بدون اسم'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{u.email || '—'}</p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{u.phone || '—'}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <RoleIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <Badge variant="outline" className={cn('text-xs border', ROLE_CLASS[u.role])}>{ROLE_LABELS[u.role] || u.role}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="outline" className={cn('text-xs border', u.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border')}>
                          {u.is_active ? 'نشط' : 'معطل'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmt(u.created_at)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-foreground hover:bg-accent" onClick={() => openEdit(u)} title="تعديل">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          {u.id !== myProfile?.id && (
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:bg-destructive/10" onClick={() => { setSelected(u); setDialogType('delete'); }} title="تعطيل">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogType === 'edit'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border">
          <DialogHeader><DialogTitle className="font-cairo text-foreground">تعديل المستخدم</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-normal text-muted-foreground">الاسم الكامل</Label>
              <Input value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))} className="bg-input border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-normal text-muted-foreground">رقم الهاتف</Label>
              <Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="bg-input border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-normal text-muted-foreground">الدور</Label>
              <Select value={formData.role} onValueChange={v => setFormData(p => ({ ...p, role: v as UserRole }))}>
                <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                  {isSuperAdmin && <SelectItem value="admin">مدير</SelectItem>}
                  <SelectItem value="instructor">محاضر</SelectItem>
                  <SelectItem value="user">طالب</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal text-muted-foreground">الحساب نشط</Label>
              <Switch checked={formData.is_active} onCheckedChange={v => setFormData(p => ({ ...p, is_active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogType(null)} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={saveUser} disabled={actionLoading}>{actionLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete/Deactivate Dialog */}
      <Dialog open={dialogType === 'delete'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm bg-card border-border">
          <DialogHeader><DialogTitle className="font-cairo text-destructive">تعطيل الحساب</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">هل تريد تعطيل حساب <span className="text-foreground font-medium">{selected?.full_name}</span>؟ يمكنك إعادة تفعيله لاحقاً.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogType(null)} className="border border-border text-foreground">إلغاء</Button>
            <Button onClick={deleteUser} disabled={actionLoading} className="bg-destructive text-white hover:bg-destructive/90">{actionLoading ? 'جاري...' : 'تعطيل'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AdminLayout>
  );
}



