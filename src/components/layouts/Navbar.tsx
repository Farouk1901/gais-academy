import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut, User, BookOpen, LayoutDashboard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const LOGO_URL = 'https://zyytenpbedirhnrwiizg.supabase.co/storage/v1/object/public/assets/brand/gais-logo.jpg';

// Matches the reference image nav order (RTL right→left = displayed left in code)
const navLinks = [
  { label: 'الرئيسية',        href: '/' },
  { label: 'من أنا',          href: '/about' },
  { label: 'الدورات',         href: '/courses' },
  { label: 'الخدمات',         href: '/services' },
  { label: 'المدونة',         href: '/blog' },
  { label: 'آراء المتدربين',  href: '/testimonials' },
  { label: 'تواصل',           href: '/contact' },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [darkMode,    setDarkMode]    = useState(true);
  const [lang,        setLang]        = useState<'AR' | 'EN'>('AR');
  const { user, profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const toggleTheme = () => {
    setDarkMode(p => !p);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // signOut errors are non-fatal; always navigate away
    } finally {
      navigate('/');
    }
  };

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.charAt(0);
    if (profile?.email)     return profile.email.charAt(0).toUpperCase();
    return 'م';
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
        scrolled
          ? 'bg-background border-border/60 shadow-sm'
          : 'bg-background border-border/30'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 md:px-6">
        <div className="flex h-14 items-center gap-3">

          {/* ── Logo (rightmost in RTL) ── */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <img
              src={LOGO_URL}
              alt="GAIS Logo"
              className="w-9 h-9 rounded-lg object-cover border border-border/40 shadow-sm"
            />
            <span className="hidden md:block text-sm font-bold text-foreground tracking-wide">
              GAIS
            </span>
          </Link>

          {/* ── Desktop Nav (center, RTL order) ── */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center" dir="rtl">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-3 py-1.5 text-sm rounded-md transition-colors duration-150 whitespace-nowrap ${
                  isActive(link.href)
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          {/* ── Right Actions (leftmost in RTL layout) ── */}
          <div className="flex items-center gap-1.5 shrink-0 ms-auto" dir="ltr">

            {/* Language toggle */}
            <div className="hidden md:flex items-center rounded-full border border-border/50 bg-muted/30 p-0.5 gap-0.5">
              {(['EN', 'AR'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full transition-colors ${
                    lang === l
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-muted/30 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
              aria-label="تبديل الثيم"
            >
              {darkMode
                ? <Sun className="w-4 h-4 text-yellow-400" />
                : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <>
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold border border-primary/20">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    <div className="px-3 py-2.5 border-b border-border">
                      <p className="text-sm font-semibold truncate">{profile?.full_name || 'مستخدم'}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{profile?.email}</p>
                      {isAdmin && (
                        <Badge variant="outline" className="mt-1.5 text-xs border-primary/30 text-primary bg-primary/8">
                          مدير النظام
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2 text-sm">
                        <LayoutDashboard className="h-3.5 w-3.5" />لوحة الطالب
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/courses" className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-3.5 w-3.5" />كورساتي
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/profile" className="flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5" />إعدادات الحساب
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center gap-2 text-sm text-primary">
                            <Shield className="h-3.5 w-3.5" />لوحة الإدارة
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive focus:text-destructive flex items-center gap-2 text-sm"
                    >
                      <LogOut className="h-3.5 w-3.5" />تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Platform entry button (logged in) */}
                <Button size="sm" asChild
                  className="hidden md:flex h-8 text-xs px-4 bg-green-600 hover:bg-green-700 text-white border-0">
                  <Link to="/dashboard">دخول المنصة</Link>
                </Button>
              </>
            ) : (
              <>
                {/* Login only — no public registration */}
                <Button size="sm" asChild
                  className="hidden md:flex h-8 text-xs px-4 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/login">دخول المنصة</Link>
                </Button>
              </>
            )}

            {/* ── Mobile Hamburger ── */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"
                  className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/40">
                  <Menu className="h-4.5 w-4.5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-sidebar p-0 border-sidebar-border">
                <div className="flex flex-col h-full">
                  {/* Sheet Header */}
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-sidebar-border">
                    <div className="flex items-center gap-2.5">
                      <img src={LOGO_URL} alt="GAIS" className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-sidebar-foreground font-bold text-sm">GAIS Academy</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}
                      className="h-7 w-7 text-sidebar-foreground hover:bg-sidebar-accent">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Nav links */}
                  <nav className="flex flex-col gap-0.5 p-3 flex-1" dir="rtl">
                    {navLinks.map(link => (
                      <Link key={link.href} to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                          isActive(link.href)
                            ? 'text-sidebar-primary bg-sidebar-accent font-semibold'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                        }`}>
                        {link.label}
                        {isActive(link.href) && (
                          <span className="ms-auto w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    ))}

                    {user && (
                      <>
                        <div className="border-t border-sidebar-border my-2" />
                        <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/60">
                          <LayoutDashboard className="h-4 w-4" />لوحة الطالب
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg text-primary hover:bg-sidebar-accent/60">
                            <Shield className="h-4 w-4" />لوحة الإدارة
                          </Link>
                        )}
                      </>
                    )}

                    {/* Mobile lang + theme */}
                    <div className="border-t border-sidebar-border mt-2 pt-3 px-3 flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-sidebar-border bg-sidebar-accent/30 p-0.5 gap-0.5">
                        {(['EN', 'AR'] as const).map(l => (
                          <button key={l} onClick={() => setLang(l)}
                            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full transition-colors ${
                              lang === l ? 'bg-primary text-primary-foreground' : 'text-sidebar-foreground'
                            }`}>{l}</button>
                        ))}
                      </div>
                      <button onClick={toggleTheme}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">
                        {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
                      </button>
                    </div>
                  </nav>

                  {/* Footer */}
                  <div className="p-4 border-t border-sidebar-border">
                    {user ? (
                      <>
                        <div className="flex items-center gap-2.5 mb-3 px-1">
                          <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-primary text-xs font-bold">{getInitials()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sidebar-foreground text-xs font-semibold truncate">{profile?.full_name || 'مستخدم'}</p>
                            <p className="text-muted-foreground text-[10px] truncate">{profile?.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setMobileOpen(false); void handleSignOut(); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-sidebar-accent/60 rounded-lg transition-colors">
                          <LogOut className="h-3.5 w-3.5" />تسجيل الخروج
                        </button>
                      </>
                    ) : (
                      <Button size="sm" asChild
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link to="/login" onClick={() => setMobileOpen(false)}>
                          دخول المنصة
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

