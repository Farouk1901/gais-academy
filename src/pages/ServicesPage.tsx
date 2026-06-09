import PublicLayout from '@/components/layouts/PublicLayout';
import { Brain, Zap, Users, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const services = [
  { icon: Brain,    title: 'تدريب الذكاء الاصطناعي',    desc: 'برامج تدريبية متخصصة في مجال الذكاء الاصطناعي وتعلم الآلة لجميع المستويات.' },
  { icon: Zap,      title: 'استشارات الشركات',            desc: 'نقدم استشارات احترافية للشركات الراغبة في تبني تقنيات الذكاء الاصطناعي في أعمالها.' },
  { icon: Users,    title: 'ورش عمل جماعية',             desc: 'ورش عمل تفاعلية للفرق والمؤسسات تشمل التطبيق العملي على مشاريع حقيقية.' },
  { icon: BookOpen, title: 'محتوى تعليمي مخصص',          desc: 'تطوير محتوى تعليمي مخصص حسب احتياجات مؤسستك أو فريقك.' },
];

export default function ServicesPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 py-20" dir="rtl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">خدماتنا</h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto text-pretty">
            نقدم طيفاً واسعاً من الخدمات التعليمية والاستشارية في مجال الذكاء الاصطناعي
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map(s => (
            <Card key={s.title} className="h-full">
              <CardContent className="p-6 flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">{s.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}



