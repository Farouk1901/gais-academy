import { useEffect, useState } from 'react';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Shield, Crown, Save, RefreshCw } from 'lucide-react';
import type { Permission } from '@/types/types';
import AdminLayout from '@/components/layouts/AdminLayout';

const ROLES = [
  { key: 'admin', label: 'مدير', icon: Shield, color: 'text-primary' },
  { key: 'instructor', label: 'محاضر', icon: Shield, color: 'text-info' },
];

export default function AdminRolesPage() {
  const { isSuperAdmin } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePerms, setRolePerms] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: perms, error: e1 }, { data: rp, error: e2 }] = await Promise.all([
        supabase.from('permissions').select('*').order('group_ar').order('label_ar'),
        supabase.from('role_permissions').select('role, permission_key'),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      setPermissions(perms || []);
      const map: Record<string, Set<string>> = {};
      ROLES.forEach(r => { map[r.key] = new Set(); });
      (rp || []).forEach(({ role, permission_key }: { role: string; permission_key: string }) => {
        if (!map[role]) map[role] = new Set();
        map[role].add(permission_key);
      });
      setRolePerms(map);
    } catch (err) {
      console.error('AdminRolesPage fetchData error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const togglePermission = (role: string, key: string) => {
    if (!isSuperAdmin) { toast.error('فقط Super Admin يمكنه تعديل الصلاحيات'); return; }
    setRolePerms(prev => {
      const updated = { ...prev };
      const set = new Set(prev[role] || []);
      if (set.has(key)) set.delete(key); else set.add(key);
      updated[role] = set;
      return updated;
    });
  };

  const saveRole = async (role: string) => {
    if (!isSuperAdmin) { toast.error('فقط Super Admin يمكنه تعديل الصلاحيات'); return; }
    setSaving(role);
    try {
      await supabase.from('role_permissions').delete().eq('role', role);
      const permsToInsert = Array.from(rolePerms[role] || []).map(key => ({ role, permission_key: key }));
      if (permsToInsert.length > 0) {
        const { error } = await supabase.from('role_permissions').insert(permsToInsert);
        if (error) throw error;
      }
      toast.success(`تم حفظ صلاحيات ${ROLES.find(r => r.key === role)?.label}`);
    } catch { toast.error('فشل في حفظ الصلاحيات'); } finally { setSaving(null); }
  };

  const groupedPerms = permissions.reduce((acc, p) => {
    if (!acc[p.group_ar]) acc[p.group_ar] = [];
    acc[p.group_ar].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <AdminLayout>
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground font-cairo">الأدوار والصلاحيات</h2>
          <p className="text-sm text-muted-foreground">تحكم في صلاحيات كل دور</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchData} className="border border-border text-foreground hover:bg-accent">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Super Admin notice */}
      <Card className="stat-card border-warning/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Crown className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning font-cairo">Super Admin</p>
            <p className="text-xs text-muted-foreground mt-0.5">يملك جميع الصلاحيات تلقائياً ولا يمكن تقييده. فقط Super Admin يمكنه تعديل هذه الإعدادات.</p>
          </div>
        </CardContent>
      </Card>

      {!isSuperAdmin && (
        <Card className="stat-card border-destructive/20">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">⚠️ فقط Super Admin يمكنه تعديل الصلاحيات. أنت تشاهد هذه الصفحة للقراءة فقط.</p>
          </CardContent>
        </Card>
      )}

      {/* Role cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {ROLES.map(role => {
          const Icon = role.icon;
          const currentPerms = rolePerms[role.key] || new Set<string>();
          return (
            <Card key={role.key} className="stat-card h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${role.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-cairo text-foreground">{role.label}</CardTitle>
                      <CardDescription className="text-xs">{currentPerms.size} صلاحية مفعّلة</CardDescription>
                    </div>
                  </div>
                  {isSuperAdmin && (
                    <Button size="sm" onClick={() => saveRole(role.key)} disabled={saving === role.key} className="text-xs h-7 gap-1">
                      <Save className="w-3 h-3" />{saving === role.key ? 'جاري...' : 'حفظ'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-[480px] space-y-4">
                {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full bg-muted" />) :
                  Object.entries(groupedPerms).map(([group, perms]) => (
                    <div key={group}>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{group}</p>
                      <div className="space-y-1.5">
                        {perms.map(perm => (
                          <div key={perm.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                            <span className="text-sm text-foreground">{perm.label_ar}</span>
                            <Switch
                              checked={currentPerms.has(perm.key)}
                              onCheckedChange={() => togglePermission(role.key, perm.key)}
                              disabled={!isSuperAdmin}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                }
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
    </AdminLayout>
  );
}
