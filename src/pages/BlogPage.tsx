import PublicLayout from '@/components/layouts/PublicLayout';
import { BookOpen } from 'lucide-react';

export default function BlogPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-20 text-center" dir="rtl">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <BookOpen className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">المدونة</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto text-pretty">
          قريباً — سنشارك مقالات ودروساً حول أحدث تطورات الذكاء الاصطناعي وتطبيقاته.
        </p>
      </div>
    </PublicLayout>
  );
}



