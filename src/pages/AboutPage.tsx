import { Brain, Target, Users, Award, Cpu, Shield } from 'lucide-react';
import PublicLayout from '@/components/layouts/PublicLayout';

const values = [
  { icon: Brain, title: 'الجودة أولاً', desc: 'محتوى تعليمي عالي الجودة يُعدّ بعناية من قبل خبراء في المجال.' },
  { icon: Target, title: 'التعلم العملي', desc: 'نؤمن بالتعلم من خلال التطبيق الفعلي والمشاريع الحقيقية.' },
  { icon: Users, title: 'مجتمع متعاون', desc: 'بيئة تعليمية داعمة تشجع على التعاون وتبادل الخبرات.' },
  { icon: Award, title: 'الاعتراف بالإنجاز', desc: 'شهادات معتمدة تُوثّق جهودك وتُعزّز مسيرتك المهنية.' },
  { icon: Cpu, title: 'محتوى محدّث', desc: 'نواكب أحدث التطورات في مجال الذكاء الاصطناعي باستمرار.' },
  { icon: Shield, title: 'الأمان والخصوصية', desc: 'حماية بيانات الطلاب والمحتوى التعليمي بأعلى معايير الأمان.' },
];

const team = [
  { name: 'أ. محمد الجوهري', role: 'المؤسس والمدير التنفيذي', bio: 'خبير في الذكاء الاصطناعي وتعلم الآلة مع أكثر من 10 سنوات خبرة.' },
  { name: 'أ. سارة أحمد', role: 'مدير المحتوى التعليمي', bio: 'متخصصة في التعلم العميق وبناء المناهج التعليمية التقنية.' },
  { name: 'أ. خالد محمود', role: 'مدير التقنية', bio: 'مهندس برمجيات متخصص في بناء المنصات التعليمية الرقمية.' },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-card border-b border-border py-16">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            من نحن
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            أكاديمية الجوهري للذكاء الاصطناعي (GAIS) هي منصة تعليمية عربية متخصصة في الذكاء الاصطناعي،
            تأسست بهدف توفير محتوى تعليمي عالي الجودة باللغة العربية لكل من يريد دخول عالم الذكاء الاصطناعي.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 space-y-16">
        {/* Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">رسالتنا</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              نسعى إلى جعل تعلم الذكاء الاصطناعي متاحاً وميسراً لكل ناطق بالعربية،
              من خلال تقديم محتوى تعليمي منظم ومتدرج يأخذ المتعلم من الصفر حتى الاحتراف.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              نؤمن بأن اللغة العربية لا يجب أن تكون عائقاً أمام تعلم التقنيات الحديثة،
              لذلك نقدم كل محتوانا بجودة عالمية باللغة العربية.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="space-y-4">
              {[
                { label: 'طلاب مسجلون', value: '12,000+' },
                { label: 'كورس متاح', value: '48+' },
                { label: 'ساعة محتوى', value: '800+' },
                { label: 'شهادة مُصدرة', value: '5,200+' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{stat.label}</span>
                  <span className="text-foreground font-semibold ltr-number">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-8 text-center">قيمنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map(v => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="p-5 rounded-xl border border-border bg-card">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <h3 className="text-foreground font-semibold text-sm mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-8 text-center">فريقنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {team.map(m => (
              <div key={m.name} className="p-5 rounded-xl border border-border bg-card text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-semibold text-lg">{m.name.charAt(3)}</span>
                </div>
                <h3 className="text-foreground font-semibold text-sm">{m.name}</h3>
                <p className="text-primary text-xs mb-2">{m.role}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
