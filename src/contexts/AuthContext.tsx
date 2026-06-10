import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) { console.error('Failed to get profile:', error); return null; }
  return data;
}

/** Log admin activity */
export async function logActivity(
  adminId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  await supabase.from('admin_activity_logs').insert({
    admin_id: adminId,
    action,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    details: details ?? {},
  });
}

/** Translate Supabase Auth error codes to Arabic */
export function translateAuthError(message: string): string {
  if (!message) return 'حدث خطأ غير متوقع';
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid credentials'))
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  if (m.includes('email not confirmed'))
    return 'البريد الإلكتروني غير مُفعَّل، يرجى التحقق من بريدك';
  if (m.includes('user not found'))
    return 'لا يوجد حساب بهذا البريد الإلكتروني';
  if (m.includes('too many requests') || m.includes('rate limit') || m.includes('429'))
    return 'محاولات كثيرة، يرجى الانتظار قليلاً ثم المحاولة مجدداً';
  if (m.includes('network') || m.includes('fetch'))
    return 'تعذّر الاتصال بالخادم، تحقق من اتصالك بالإنترنت';
  if (m.includes('email already') || m.includes('already registered') || m.includes('مسجَّل'))
    return 'هذا البريد الإلكتروني مسجَّل مسبقاً';
  if (m.includes('password') && m.includes('short'))
    return 'كلمة المرور قصيرة جداً (6 أحرف على الأقل)';
  if (m.includes('signup') && m.includes('disabled'))
    return 'التسجيل متوقف حالياً، يرجى المحاولة لاحقاً';
  return 'حدث خطأ، يرجى المحاولة مرة أخرى';
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role: string | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canAccess: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const initialSessionInProgress = useRef(false);

  // ── Load role/user permissions ──────────────────────────────────────────────
  const loadPermissions = async (userId: string, role: string) => {
    try {
      const { data: rolePerm } = await supabase
        .from('role_permissions')
        .select('permission_key')
        .eq('role', role);
      const { data: userPerm } = await supabase
        .from('user_permissions')
        .select('permission_key, granted')
        .eq('user_id', userId);

      const granted = new Set<string>((rolePerm || []).map((r: { permission_key: string }) => r.permission_key));
      (userPerm || []).forEach((p: { permission_key: string; granted: boolean }) => {
        if (p.granted) granted.add(p.permission_key);
        else granted.delete(p.permission_key);
      });
      setUserPermissions(Array.from(granted));
    } catch {
      setUserPermissions([]);
    }
  };

  // ── Load user profile ───────────────────────────────────────────────────────
  const loadUserProfile = async (userId: string) => {
    const perCallTimer = setTimeout(() => setProfileLoaded(true), 5000);
    try {
      const profileData = await getProfile(userId);
      setProfile(profileData);
      if (profileData) await loadPermissions(userId, profileData.role);
    } catch (err) {
      console.warn('loadUserProfile error (profile preserved):', err);
    } finally {
      clearTimeout(perCallTimer);
      setProfileLoaded(true);
    }
  };

  const refreshProfile = async () => {
    if (!user) { setProfile(null); setProfileLoaded(true); return; }
    await loadUserProfile(user.id);
  };

  // ── Session bootstrap ───────────────────────────────────────────────────────
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setProfileLoaded(true);
    }, 3000);

    initialSessionInProgress.current = true;
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfileLoaded(true);
        }
      })
      .catch(() => { setProfileLoaded(true); })
      .finally(() => {
        initialSessionInProgress.current = false;
        clearTimeout(safetyTimer);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        if (event === 'SIGNED_IN') {
          if (initialSessionInProgress.current) return;
          setProfileLoaded(false);
          await loadUserProfile(session.user.id);
        } else if (event === 'TOKEN_REFRESHED') {
          // No-op: avoid unnecessary re-renders on token refresh
          return;
        } else {
          await loadUserProfile(session.user.id);
        }
      } else {
        setProfile(null);
        setUserPermissions([]);
        setProfileLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sign In ─────────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const userId = data.user?.id;
      let role: string | null = null;
      if (userId) {
        const { data: p } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
        role = p?.role ?? null;
      }
      return { error: null, role };
    } catch (error) {
      return { error: error as Error, role: null };
    }
  };

  // ── Sign Up ─────────────────────────────────────────────────────────────────
  // Flow:
  //   1. supabase.auth.signUp creates the user in auth.users
  //   2. The DB trigger `on_auth_user_created` (SECURITY DEFINER) auto-creates
  //      a row in public.profiles with role='user', reading full_name & phone
  //      from raw_user_meta_data.
  //   3. Since email confirmation is OFF, the user is immediately authenticated.
  //   4. We do NOT attempt any client-side INSERT/UPSERT — the trigger handles it.
  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const metadata: Record<string, string> = { full_name: fullName };
      if (phone) metadata.phone = phone;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin + '/dashboard',
        },
      });
      if (error) throw error;

      // Detect duplicate email (Supabase returns empty identities for existing emails)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('هذا البريد الإلكتروني مسجَّل مسبقاً');
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // ── Sign Out ────────────────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      setUserPermissions([]);
      setProfileLoaded(true);
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('signOut error (ignored):', err);
    }
  };

  // ── Derived state ───────────────────────────────────────────────────────────
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isSuperAdmin = profile?.role === 'super_admin';
  const canAccess = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    return userPermissions.includes(permission);
  };
  const isLoading = loading || (user !== null && !profileLoaded);

  return (
    <AuthContext.Provider value={{
      user, profile, loading: isLoading,
      signIn, signUp, signOut, refreshProfile,
      isAdmin, isSuperAdmin, canAccess,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
