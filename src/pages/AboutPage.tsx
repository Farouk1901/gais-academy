import { Brain, Target, Users, Award, Cpu, Shield, GraduationCap, Sparkles } from 'lucide-react';
import PublicLayout from '@/components/layouts/PublicLayout';

const IMG_INSTRUCTOR = 'https://zyytenpbedirhnrwiizg.supabase.co/storage/v1/object/public/assets/instructor/ahmed-aljohary.jpg';

const values = [
  { icon: Brain, title: 'الجودة أولاً', desc: 'محتوى تعليمي عالي الجودة يُعدّ بعناية من قبل خبراء في المجال.' },
  { icon: Target, title: 'التعلم العملي', desc: 'نؤمن بالتعلم من خلال التطبيق الفعلي والمشاريع الحقيقية.' },
  { icon: Users, title: 'مجتمع متعاون', desc: 'بيئة تعليمية داعمة تشجع على التعاون وتبادل الخبرات.' },
  { icon: Award, title: 'الاعتراف بالإنجاز', desc: 'شهادات معتمدة تُوثّق جهودك وتُعزّز مسيرتك المهنية.' },
  { icon: Cpu, title: 'محتوى محدّث', desc: 'نواكب أحدث التطورات في مجال الذكاء الاصطناعي باستمرار.' },
  { icon: Shield, title: 'الأمان والخصوصية', desc: 'حماية بيانات الطلاب والمحتوى التعليمي بأعلى معايير الأمان.' },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative bg-card border-b border-border py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-cyan-500/5" />
        <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            تعرّف على أكاديمية GAIS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-5">من نحن</h1>
          <p className="text-muted-foreground text-sm leading-relaxed text-pretty max-w-2xl mx-auto">
            أكاديمية الجوهري للذكاء الاصطناعي (GAIS) هي منصة تعليمية عربية متخصصة في الذكاء الاصطناعي،
            تأسست بهدف توفير محتوى تعليمي عالي الجودة باللغة العربية لكل من يريد دخول عالم الذكاء الاصطناعي.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 space-y-20">

        {/* Founder Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/15 blur-2xl scale-110" />
              <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-primary/25 shadow-2xl">
                <img src={IMG_INSTRUCTOR} alt="م. أحمد الجوهري - مؤسس الأكاديمية"
                  className="w-full h-full object-cover object-top" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">م. أحمد الجوهري</h3>
            <p className="text-primary text-sm font-medium mb-2">المؤسس والمدرب الرئيسي</p>
            <p className="text-muted-foreground text-xs text-center max-w-xs">
              خبير في الذكاء الاصطناعي وتعلم الآلة وإنتاج المحتوى الرقمي بتقنيات AI
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">رسالتنا</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
              نسعى إلى جعل تعلم الذكاء الاصطناعي متاحاً وميسراً لكل ناطق بالعربية،
              من خلال تقديم محتوى تعليمي منظم ومتدرج يأخذ المتعلم من الصفر حتى الاحتراف.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              نؤمن بأن اللغة العربية لا يجب أن تكون عائقاً أمام تعلم التقنيات الحديثة،
              لذلك نقدم كل محتوانا بجودة عالمية باللغة العربية.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: GraduationCap, label: 'محتوى عربي أصيل', color: 'text-primary' },
                { icon: Target, label: 'تطبيقات عملية', color: 'text-cyan-400' },
                { icon: Award, label: 'شهادات معتمدة', color: 'text-warning' },
                { icon: Users, label: 'دعم متواصل', color: 'text-success' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-card/50">
                  <f.icon className={`w-4 h-4 ${f.color} shrink-0`} />
                  <span className="text-xs text-foreground font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3">قيمنا</h2>
            <p className="text-muted-foreground text-sm">المبادئ التي نلتزم بها في كل ما نقدمه</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {values.map(v => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="p-6 rounded-xl border border-border bg-card hover:shadow-md hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-foreground font-semibold text-sm mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
