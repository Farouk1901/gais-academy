import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, MessageCircle, Heart, ExternalLink, Sparkles } from 'lucide-react';

const LOGO_URL = 'https://zyytenpbedirhnrwiizg.supabase.co/storage/v1/object/public/assets/brand/gais-logo.jpg';

const footerLinks = {
  platform: [
    { label: 'الدورات التدريبية', href: '/courses' },
    { label: 'عن الأكاديمية', href: '/about' },
    { label: 'خطط الأسعار', href: '/pricing' },
    { label: 'الأسئلة الشائعة', href: '/faq' },
  ],
  student: [
    { label: 'لوحة الطالب', href: '/dashboard' },
    { label: 'كورساتي', href: '/dashboard/courses' },
    { label: 'الشهادات', href: '/dashboard/certificates' },
    { label: 'الدعم الفني', href: '/dashboard/support' },
  ],
  legal: [
    { label: 'شروط الاستخدام', href: '/terms' },
    { label: 'سياسة الخصوصية', href: '/privacy' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-card/30 mt-auto overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-primary/[0.04] pointer-events-none" />

      <div className="relative container mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* ── Brand Column ── */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <img src={LOGO_URL} alt="GAIS" className="w-11 h-11 rounded-xl object-cover border border-border/50 shadow-sm" />
              <div>
                <p className="text-foreground font-bold text-base leading-none">أكاديمية الجوهري</p>
                <p className="text-muted-foreground text-[10px] tracking-wider mt-1 font-medium">GAIS · AI Academy</p>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px]">
              منصة عربية رائدة لتعلم الذكاء الاصطناعي وأدواته بمحتوى احترافي وعملي. تعلّم من الصفر حتى الاحتراف مع م. أحمد الجوهري.
            </p>

            {/* Social Links — م. أحمد الجوهري */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/Farouk1881"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/10 to-blue-500/5 border border-blue-500/20 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-4.5 w-4.5" />
              </a>
              <a
                href="https://wa.me/201069689082"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-10 h-10 rounded-xl bg-gradient-to-br from-green-600/10 to-green-500/5 border border-green-500/20 flex items-center justify-center text-green-500 hover:bg-green-600 hover:text-white hover:border-green-600 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          {/* ── Platform Links ── */}
          <div className="lg:col-span-2">
            <p className="text-foreground font-bold text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              المنصة
            </p>
            <ul className="space-y-3">
              {footerLinks.platform.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground text-sm hover:text-primary transition-colors duration-200 flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary rounded-full transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Student Area ── */}
          <div className="lg:col-span-2">
            <p className="text-foreground font-bold text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              منطقة الطالب
            </p>
            <ul className="space-y-3">
              {footerLinks.student.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground text-sm hover:text-primary transition-colors duration-200 flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary rounded-full transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact + Instructor ── */}
          <div className="lg:col-span-4">
            <p className="text-foreground font-bold text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              تواصل مع المدرب
            </p>

            {/* Instructor Card */}
            <div className="rounded-2xl border border-border bg-card/50 p-4 mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">أ</span>
                </div>
                <div>
                  <p className="text-foreground font-bold text-sm">م. أحمد الجوهري</p>
                  <p className="text-muted-foreground text-[11px]">Ahmed Gohary — مؤسس الأكاديمية</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href="https://www.facebook.com/Farouk1881" target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600/10 text-blue-500 text-xs font-medium border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all duration-300">
                  <Facebook className="h-3.5 w-3.5" />
                  فيسبوك
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a href="https://wa.me/201069689082" target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-600/10 text-green-500 text-xs font-medium border border-green-500/20 hover:bg-green-600 hover:text-white transition-all duration-300">
                  <MessageCircle className="h-3.5 w-3.5" />
                  واتساب
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground text-xs font-medium">هاتف / واتساب</p>
                  <a href="tel:+201069689082" className="text-muted-foreground text-sm hover:text-primary transition-colors ltr-number">
                    +20 106 968 9082
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground text-xs font-medium">الموقع</p>
                  <p className="text-muted-foreground text-sm">القاهرة، مصر</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-border mt-12 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-xs flex items-center gap-1.5">
              © {currentYear} أكاديمية الجوهري للذكاء الاصطناعي — GAIS. جميع الحقوق محفوظة.
              <Heart className="w-3 h-3 text-red-400 inline-block" />
            </p>
            <div className="flex items-center gap-5">
              {footerLinks.legal.map(link => (
                <Link key={link.href} to={link.href} className="text-muted-foreground text-xs hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}