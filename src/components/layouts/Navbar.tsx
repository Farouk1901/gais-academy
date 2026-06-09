import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, LogOut, User, BookOpen, LayoutDashboard, Shield,
  Moon, Sun, GraduationCap, Award, Settings, MessageSquare,
  Receipt, ChevronDown, Sparkles
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const LOGO_URL = '/images/logo.png';

const navLinks = [
  { label: 'الرئيسية', href: '/' },
  { label: 'الدورات', href: '/courses' },
  { label: 'من نحن', href: '/about' },
  { label: 'الأسعار', href: '/pricing' },
  { label: 'آراء المتدربين', href: '/testimonials' },
  { label: 'تواصل معنا', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleSignOut = async () => {
    try { await signOut(); } catch { /* ok */ } finally { navigate('/'); }
  };

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.charAt(0);
    if (profile?.email) return profile.email.charAt(0).toUpperCase();
    return 'م';
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 border-b ${
        scrolled
          ? 'glass border-border/50 shadow-lg shadow-black/5'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 shrink-0 group">
            <div className="relative">
              <img
                src={LOGO_URL}
                alt="GAIS Logo"
                className="w-10 h-10 rounded-xl object-cover border border-border/50 shadow-sm group-hover:shadow-md transition-shadow"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-foreground leading-none">أكاديمية الجوهري</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wider font-medium">GAIS Academy</p>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center" dir="rtl">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-4 py-2 text-sm rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive(link.href)
                    ? 'text-primary font-semibold bg-primary/8'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-2 shrink-0" dir="ltr">

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative w-9 h-9 rounded-xl border border-border/60 bg-card/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-300 flex items-center justify-center overflow-hidden group"
              aria-label="تبديل الثيم"
            >
              <Sun className={`w-4 h-4 absolute transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
              <Moon className={`w-4 h-4 absolute transition-all duration-300 ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
            </button>

            {user ? (
              <>
                {/* ── User Menu (enhanced like AlMentor reference) ── */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 hover:border-primary/30 px-2 py-1.5 transition-all duration-200 group">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary text-white text-xs font-bold">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-xs font-medium text-foreground max-w-[100px] truncate">
                        {profile?.full_name || 'مستخدم'}
                      </span>
                      <ChevronDown className="hidden md:block w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 p-0" sideOffset={8}>
                    {/* Profile header */}
                    <div className="px-4 py-4 bg-gradient-to-br from-primary/5 to-transparent border-b border-border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11">
                          <AvatarFallback className="bg-primary text-white text-base font-bold">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground truncate">{profile?.full_name || 'مستخدم'}</p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{profile?.email}</p>
                          {isAdmin && (
                            <Badge className="mt-1.5 text-[10px] h-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                              <Shield className="w-3 h-3 ml-1" />مدير النظام
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider px-4 py-2">
                        حسابي
                      </DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <GraduationCap className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">تقدمي</p>
                            <p className="text-[10px] text-muted-foreground">متابعة التعلم</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/courses" className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">الدورات المحفوظة</p>
                            <p className="text-[10px] text-muted-foreground">كورساتي الحالية</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/certificates" className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <Award className="h-4 w-4 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-medium">الشهادات</p>
                            <p className="text-[10px] text-muted-foreground">شهاداتي المكتسبة</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Settings className="h-4 w-4 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-medium">إعدادات الحساب</p>
                            <p className="text-[10px] text-muted-foreground">الملف الشخصي</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/support" className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
                          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                            <MessageSquare className="h-4 w-4 text-violet-500" />
                          </div>
                          <div>
                            <p className="font-medium">الرسائل</p>
                            <p className="text-[10px] text-muted-foreground">الدعم والتواصل</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/payments" className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <span>سجل الشراء</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary font-medium cursor-pointer">
                            <Shield className="h-4 w-4" />
                            <span>لوحة الإدارة</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive focus:text-destructive flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>تسجيل الخروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Dashboard button */}
                <Button size="sm" asChild
                  className="hidden md:flex h-9 text-xs px-5 bg-primary hover:bg-primary/90 text-white border-0 rounded-xl shadow-md shadow-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30">
                  <Link to="/dashboard">
                    <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                    منصة التعلم
                  </Link>
                </Button>
              </>
            ) : (
              <>
                {/* Login & Register */}
                <Button variant="ghost" size="sm" asChild
                  className="hidden md:flex h-9 text-xs px-4 text-foreground hover:text-primary rounded-xl">
                  <Link to="/login">تسجيل الدخول</Link>
                </Button>
                <Button size="sm" asChild
                  className="hidden md:flex h-9 text-xs px-5 bg-primary hover:bg-primary/90 text-white border-0 rounded-xl shadow-md shadow-primary/20">
                  <Link to="/register">
                    <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                    ابدأ مجاناً
                  </Link>
                </Button>
              </>
            )}

            {/* ── Mobile Hamburger ── */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"
                  className="lg:hidden h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/40">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-card p-0 border-border">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <img src={LOGO_URL} alt="GAIS" className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <p className="font-bold text-sm text-foreground">أكاديمية الجوهري</p>
                        <p className="text-[10px] text-muted-foreground">GAIS Academy</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}
                      className="h-8 w-8 rounded-lg">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Nav */}
                  <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto" dir="rtl">
                    {navLinks.map(link => (
                      <Link key={link.href} to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                          isActive(link.href)
                            ? 'text-primary bg-primary/8 font-semibold'
                            : 'text-foreground hover:bg-accent/50'
                        }`}>
                        {link.label}
                        {isActive(link.href) && <span className="ms-auto w-2 h-2 rounded-full bg-primary" />}
                      </Link>
                    ))}

                    {user && (
                      <>
                        <div className="border-t border-border my-3" />
                        <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm rounded-xl hover:bg-accent/50">
                          <LayoutDashboard className="h-4 w-4 text-primary" />لوحة التعلم
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm rounded-xl text-primary hover:bg-primary/8">
                            <Shield className="h-4 w-4" />لوحة الإدارة
                          </Link>
                        )}
                      </>
                    )}

                    {/* Theme toggle */}
                    <div className="border-t border-border mt-3 pt-3">
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm hover:bg-accent/50 transition-colors"
                      >
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                        {theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
                      </button>
                    </div>
                  </nav>

                  {/* Footer */}
                  <div className="p-4 border-t border-border">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 mb-3 px-2">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-white text-xs font-bold">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{profile?.full_name || 'مستخدم'}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setMobileOpen(false); void handleSignOut(); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/8 rounded-xl transition-colors">
                          <LogOut className="h-4 w-4" />تسجيل الخروج
                        </button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Button size="sm" asChild className="w-full bg-primary text-white rounded-xl h-10">
                          <Link to="/register" onClick={() => setMobileOpen(false)}>ابدأ مجاناً</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="w-full rounded-xl h-10">
                          <Link to="/login" onClick={() => setMobileOpen(false)}>تسجيل الدخول</Link>
                        </Button>
                      </div>
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



