import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) { console.error('Failed to get profile:', error); return null; }
  return data;
}

// Log admin activity
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

// Translate Supabase Auth error codes to Arabic
export function translateAuthError(message: string): string {
  if (!message) return 'حدث خطأ غير متوقع';
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid credentials'))
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  if (m.includes('email not confirmed'))
    return 'البريد الإلكتروني غير مُفعَّل، يرجى التحقق من بريدك';
  if (m.includes('user not found'))
    return 'لا يوجد حساب بهذا البريد الإلكتروني';
  if (m.includes('too many requests') || m.includes('rate limit'))
    return 'محاولات كثيرة، يرجى الانتظار قليلاً ثم المحاولة مجدداً';
  if (m.includes('network') || m.includes('fetch'))
    return 'تعذّر الاتصال بالخادم، تحقق من اتصالك بالإنترنت';
  if (m.includes('email already') || m.includes('already registered'))
    return 'هذا البريد الإلكتروني مسجَّل مسبقاً';
  if (m.includes('password') && m.includes('short'))
    return 'كلمة المرور قصيرة جداً (6 أحرف على الأقل)';
  return 'حدث خطأ، يرجى المحاولة مرة أخرى';
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
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
  // loading = true only during the very first session check
  const [loading, setLoading] = useState(true);
  // profileLoaded tracks whether we've attempted to load the profile for the current user
  // prevents RouteGuard from spinning forever when profile row is missing
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  // Tracks whether the getSession initial-load path is currently in progress.
  // Prevents onAuthStateChange SIGNED_IN from resetting profileLoaded while
  // getSession is already mid-load — which would orphan the load with no safety timer.
  const initialSessionInProgress = useRef(false);

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
      // Non-fatal: permissions default to empty
      setUserPermissions([]);
    }
  };

  const loadUserProfile = async (userId: string) => {
    // Per-call safety timer: if this load hangs for any reason (network, RLS issue,
    // etc.) the UI is unblocked within 5 s.  This is essential because the global
    // safetyTimer in useEffect is cleared by getSession.finally — meaning any
    // subsequent loadUserProfile call triggered by onAuthStateChange has NO fallback
    // without this per-call guard.
    const perCallTimer = setTimeout(() => setProfileLoaded(true), 5000);
    try {
      const profileData = await getProfile(userId);
      setProfile(profileData);
      if (profileData) await loadPermissions(userId, profileData.role);
    } catch (err) {
      // Do NOT clear profile on refresh errors — a network hiccup during
      // TOKEN_REFRESHED should not silently log admins/users out.
      // Only log the error for debugging.
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

  useEffect(() => {
    // Resolve initial session then mark global loading done.
    // Safety timeout: if Supabase hangs, never leave RouteGuard stuck on spinner.
    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setProfileLoaded(true);
    }, 3000); // 3 s is enough: getSession + getProfile should complete well within that

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
          // Skip if getSession is already handling the initial profile load.
          // Without this guard, onAuthStateChange fires SIGNED_IN for existing sessions
          // right after getSession resolves, resets profileLoaded=false, and triggers a
          // second loadUserProfile — but the global safetyTimer was already cleared by
          // getSession.finally, so if this second load hangs, isLoading stays true forever.
          if (initialSessionInProgress.current) return;
          setProfileLoaded(false);
        }
        await loadUserProfile(session.user.id);
      } else {
        setProfile(null);
        setUserPermissions([]);
        setProfileLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Fetch role immediately so callers can redirect based on role
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

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user) {
        await supabase.from('profiles').update({ full_name: fullName }).eq('id', data.user.id);
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state immediately so UI updates before Supabase responds
      setUser(null);
      setProfile(null);
      setUserPermissions([]);
      setProfileLoaded(true);
      await supabase.auth.signOut();
    } catch (err) {
      // Even if signOut call fails, local state is already cleared — user is "logged out" locally
      console.warn('signOut error (ignored):', err);
    }
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isSuperAdmin = profile?.role === 'super_admin';

  const canAccess = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    return userPermissions.includes(permission);
  };

  // Expose a combined loading flag: true while initial session resolves OR profile not yet fetched
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



