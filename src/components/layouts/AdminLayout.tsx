import { useState, ComponentType, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard, Users, BookOpen, Video, CreditCard, Bell,
  Tag, Award, HeadphonesIcon, BarChart3, Settings, LogOut,
  Menu, GraduationCap, Shield, FileText, BookMarked, ChevronDown, ChevronRight,
  Layers, Crown
} from 'lucide-react';

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  permission?: string;
}

const navGroups: NavGroup[] = [
  {
    label: 'الرئيسية',
    items: [
      { label: 'لوحة التحكم', path: '/admin', icon: LayoutDashboard },
      { label: 'التقارير والتحليلات', path: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'المستخدمون',
    items: [
      { label: 'جميع المستخدمين', path: '/admin/users', icon: Users },
      { label: 'الطلاب', path: '/admin/students', icon: GraduationCap },
      { label: 'الأدوار والصلاحيات', path: '/admin/roles', icon: Shield },
    ],
  },
  {
    label: 'المحتوى',
    items: [
      { label: 'الكورسات', path: '/admin/courses', icon: BookOpen },
      { label: 'الدروس', path: '/admin/lessons', icon: BookMarked },
      { label: 'الفيديوهات', path: '/admin/videos', icon: Video },
    ],
  },
  {
    label: 'المالية',
    items: [
      { label: 'الاشتراكات', path: '/admin/subscriptions', icon: Layers },
      { label: 'المدفوعات', path: '/admin/payments', icon: CreditCard },
      { label: 'الكوبونات', path: '/admin/coupons', icon: Tag },
    ],
  },
  {
    label: 'الخدمات',
    items: [
      { label: 'الشهادات', path: '/admin/certificates', icon: Award },
      { label: 'الإشعارات', path: '/admin/notifications', icon: Bell },
      { label: 'الدعم الفني', path: '/admin/support', icon: HeadphonesIcon },
    ],
  },
  {
    label: 'النظام',
    items: [
      { label: 'سجلات النشاط', path: '/admin/logs', icon: FileText },
      { label: 'الإعدادات', path: '/admin/settings', icon: Settings },
    ],
  },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(navGroups.map(g => g.label))
  );

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-sm font-cairo">GA</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sidebar-accent-foreground leading-tight truncate font-cairo">أكاديمية الجوهري</p>
          <p className="text-xs text-sidebar-foreground/60 truncate">GAIS Admin</p>
        </div>
      </div>

      {/* Admin badge */}
      <div className="px-4 py-3 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-sidebar-accent">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            {profile?.role === 'super_admin' ? (
              <Crown className="w-3.5 h-3.5 text-warning" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{profile?.full_name || 'المدير'}</p>
            <p className="text-[10px] text-sidebar-foreground/60">
              {profile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navGroups.map(group => (
          <div key={group.label} className="mb-1">
            <button
              onClick={() => toggleGroup(group.label)}
              className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider hover:text-sidebar-foreground/70 transition-colors"
            >
              <span>{group.label}</span>
              {expandedGroups.has(group.label)
                ? <ChevronDown className="w-3 h-3" />
                : <ChevronRight className="w-3 h-3" />}
            </button>
            {expandedGroups.has(group.label) && (
              <div className="mt-0.5 space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                        active
                          ? 'bg-primary/12 text-primary font-medium border-r-2 border-primary'
                          : 'nav-item'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-primary' : 'text-sidebar-foreground/60')} />
                      <span className="min-w-0 truncate">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="mr-auto text-[10px] px-1.5 py-0 h-4 bg-destructive/15 text-destructive border-0">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 shrink-0 space-y-1">
        <Link to="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm nav-item" onClick={onClose}>
          <BookOpen className="w-4 h-4 shrink-0 text-sidebar-foreground/60" />
          <span>الموقع الرئيسي</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full text-start text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}

interface AdminLayoutProps { children: ReactNode }

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Derive page title from current path
  const getPageTitle = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))) {
          return item.label;
        }
      }
    }
    return 'لوحة التحكم';
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-l border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center gap-3 px-4 md:px-6 py-3 border-b border-border bg-background/95 backdrop-blur shrink-0">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0 text-foreground hover:bg-accent">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-64 bg-sidebar border-l border-sidebar-border">
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <h1 className="flex-1 min-w-0 text-sm md:text-base font-semibold text-foreground truncate font-cairo">
            {getPageTitle()}
          </h1>

          <div className="flex items-center gap-2 shrink-0">
            <Badge className="hidden md:flex text-xs bg-primary/10 text-primary border-primary/20">
              لوحة الإدارة
            </Badge>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
