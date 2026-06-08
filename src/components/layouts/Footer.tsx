import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Youtube, Twitter, Linkedin, Facebook } from 'lucide-react';

const footerLinks = {
  platform: [
    { label: 'الكورسات', href: '/courses' },
    { label: 'من نحن', href: '/about' },
    { label: 'الأسئلة الشائعة', href: '/faq' },
    { label: 'تواصل معنا', href: '/contact' },
  ],
  student: [
    { label: 'لوحة الطالب', href: '/dashboard' },
    { label: 'كورساتي', href: '/dashboard/courses' },
    { label: 'الشهادات', href: '/dashboard/certificates' },
    { label: 'الدعم الفني', href: '/dashboard/support' },
  ],
};

const socials = [
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Facebook, href: '#', label: 'Facebook' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/40 mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Brand ── */}
          <div className="lg:col-span-1 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-primary font-bold text-sm font-inter">G</span>
              </div>
              <div>
                <p className="text-foreground font-semibold text-sm font-heading leading-none">أكاديمية الجوهري</p>
                <p className="text-muted-foreground text-[10px] font-inter uppercase tracking-wider mt-0.5">GAIS · AI School</p>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed text-pretty max-w-[260px]">
              منصة عربية احترافية لتعلم الذكاء الاصطناعي من الصفر إلى الاحتراف.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-150"
                  aria-label={label}
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Platform Links ── */}
          <div>
            <p className="text-foreground font-semibold text-xs uppercase tracking-wider font-inter mb-4">المنصة</p>
            <ul className="space-y-2.5">
              {footerLinks.platform.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Student Area ── */}
          <div>
            <p className="text-foreground font-semibold text-xs uppercase tracking-wider font-inter mb-4">منطقة الطالب</p>
            <ul className="space-y-2.5">
              {footerLinks.student.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <p className="text-foreground font-semibold text-xs uppercase tracking-wider font-inter mb-4">تواصل معنا</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-sm font-inter">info@gais.academy</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-sm font-inter ltr-number">+20 100 000 0000</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-sm">القاهرة، مصر</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="divider-fade mt-10 mb-6" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs font-inter">
            © {currentYear} أكاديمية الجوهري للذكاء الاصطناعي — GAIS. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/terms" className="text-muted-foreground text-xs hover:text-foreground transition-colors">
              شروط الاستخدام
            </Link>
            <span className="w-px h-3 bg-border" />
            <Link to="/privacy" className="text-muted-foreground text-xs hover:text-foreground transition-colors">
              سياسة الخصوصية
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );

}