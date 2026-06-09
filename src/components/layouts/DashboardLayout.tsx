import { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Award, CreditCard,
  HeadphonesIcon, Settings, Bell, LogOut, Menu, X,
  GraduationCap, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const studentNavItems = [
  { label: 'لوحة التحكم', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'كورساتي', icon: BookOpen, href: '/dashboard/courses' },
  { label: 'حالة الاشتراك', icon: GraduationCap, href: '/dashboard/subscription' },
  { label: 'الشهادات', icon: Award, href: '/dashboard/certificates' },
  { label: 'المدفوعات', icon: CreditCard, href: '/dashboard/payments' },
  { label: 'الدعم الفني', icon: HeadphonesIcon, href: '/dashboard/support' },
  { label: 'الإشعارات', icon: Bell, href: '/dashboard/notifications' },
  { label: 'إعدادات الحساب', icon: Settings, href: '/dashboard/profile' },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const isActive = (href: string) =>
    href === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    onClose?.();
  };

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.charAt(0);
    return 'م';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 mb-4" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-primary font-semibold text-xs font-montserrat">G</span>
          </div>
          <div>
            <div className="text-sidebar-foreground font-semibold text-xs">أكاديمية الجوهري</div>
            <div className="text-muted-foreground text-xs font-montserrat">GAIS</div>
          </div>
        </Link>
        {/* Profile */}
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sidebar-foreground text-sm font-medium truncate">
              {profile?.full_name || 'مستخدم'}
            </p>
            <p className="text-muted-foreground text-xs truncate">{profile?.email || ''}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {studentNavItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {active && <ChevronLeft className="h-3 w-3 mr-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link
          to="/courses"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <GraduationCap className="h-4 w-4 shrink-0" />
          تصفح الكورسات
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-sidebar border-l border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-40">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-sidebar p-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                className="absolute top-3 left-3 text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <X className="h-4 w-4" />
              </Button>
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="text-sm font-semibold text-foreground">لوحة الطالب</span>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

