import { useState, useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function RouteGuard({ children, requireAuth = false, requireAdmin = false }: RouteGuardProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Hard-cap: never show spinner longer than 5 s.
  // AuthContext safety fires at 3 s; this is a final backstop at 5 s.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (!loading) { setTimedOut(false); return; }
    const t = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(t);
  }, [loading]);

  // Still waiting for session / profile resolution
  if (loading && !timedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated → send to login, preserving the intended destination
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin) {
    // Not logged in → go to login (will redirect back after auth)
    if (!user) {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
    // Logged in but not admin → go to dashboard (not /login to avoid redirect loop)
    if (!['admin', 'super_admin'].includes(profile?.role ?? '')) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

