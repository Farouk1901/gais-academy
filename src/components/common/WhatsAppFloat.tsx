import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppFloat() {
  const [showTooltip, setShowTooltip] = useState(false);
  const phone = '201069689082';
  const message = encodeURIComponent('مرحباً م. أحمد، أريد الاستفسار عن دورات أكاديمية الجوهري للذكاء الاصطناعي');
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <>
      {/* Tooltip */}
      {showTooltip && (
        <div className="fixed bottom-24 left-6 z-[998] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 max-w-[260px]" dir="rtl">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-bold text-foreground">تحتاج مساعدة؟ 👋</p>
              <button onClick={() => setShowTooltip(false)} className="text-muted-foreground hover:text-foreground p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              تواصل مباشرة مع م. أحمد الجوهري عبر واتساب للاستفسار عن الدورات والاشتراكات.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20BD5A] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              ابدأ المحادثة
            </a>
          </div>
          {/* Arrow */}
          <div className="absolute -bottom-2 left-8 w-4 h-4 bg-card border-r border-b border-border transform rotate-45" />
        </div>
      )}

      {/* Floating Button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float group"
        onMouseEnter={() => setShowTooltip(true)}
        aria-label="تواصل عبر واتساب"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        {/* Ripple effect */}
        <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366]/30 pointer-events-none" />
      </a>
    </>
  );
}

