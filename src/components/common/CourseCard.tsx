import { Link } from 'react-router-dom';
import { Clock, BookOpen, Users, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Course } from '@/types/types';

const levelLabels: Record<string, string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
};

const levelColors: Record<string, string> = {
  beginner: 'text-success border-success/25 bg-success/8',
  intermediate: 'text-warning border-warning/25 bg-warning/8',
  advanced: 'text-primary border-primary/25 bg-primary/8',
};

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const price = course.discount_price ?? course.price;
  const hasDiscount = course.discount_price !== null && course.discount_price < course.price;

  return (
    <div className="group flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:border-primary/20 hover:shadow-[0_4px_24px_rgba(59,130,246,0.1)]">
      {/* Thumbnail */}
      <div className="aspect-video w-full overflow-hidden bg-muted relative shrink-0">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title_ar}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/12 to-primary/4">
            <BookOpen className="h-10 w-10 text-primary/20" />
          </div>
        )}
        {/* Level badge */}
        <div className="absolute top-2.5 end-2.5">
          <Badge
            variant="outline"
            className={`text-xs font-medium backdrop-blur-sm ${levelColors[course.level] || ''}`}
          >
            {levelLabels[course.level]}
          </Badge>
        </div>
        {/* Free badge */}
        {price === 0 && (
          <div className="absolute top-2.5 start-2.5">
            <Badge variant="outline" className="text-xs text-success border-success/25 bg-success/10 backdrop-blur-sm">
              مجاني
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Title */}
        <h3 className="font-heading text-foreground font-semibold text-sm leading-snug text-balance line-clamp-2">
          {course.title_ar}
        </h3>

        {/* Instructor */}
        {course.instructor_name && (
          <p className="text-muted-foreground text-xs">{course.instructor_name}</p>
        )}

        {/* Rating */}
        {course.rating > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`h-3 w-3 ${s <= Math.round(course.rating) ? 'fill-warning text-warning' : 'fill-muted text-muted-foreground'}`} />
              ))}
            </div>
            <span className="text-foreground text-xs font-medium font-inter ltr-number">
              {course.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground text-xs font-inter ltr-number">
              ({course.reviews_count})
            </span>
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-muted-foreground text-xs">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="ltr-number">{course.duration_hours}h</span>
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 shrink-0" />
            <span>{course.lessons_count} درس</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3 shrink-0" />
            <span className="ltr-number">{course.students_count.toLocaleString()}</span>
          </span>
        </div>

        <div className="flex-1" />

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-foreground font-bold text-sm font-inter ltr-number">
              {price === 0 ? 'مجاني' : `${price} ج.م`}
            </span>
            {hasDiscount && (
              <span className="text-muted-foreground text-xs line-through font-inter ltr-number">
                {course.price}
              </span>
            )}
          </div>
          <Button
            size="sm"
            asChild
            variant="ghost" className="text-xs h-7 px-3 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 hover:border-primary transition-all duration-200"
          >
            <Link to={`/courses/${course.id}`}>عرض الكورس</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


interface CourseCardProps {
  course: Course;
}


