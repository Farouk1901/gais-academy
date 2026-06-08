import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock, BookOpen, Users, Star, CheckCircle2,
  Play, Lock, ChevronDown, ArrowLeft, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PublicLayout from '@/components/layouts/PublicLayout';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Course, Lesson, CourseReview } from '@/types/types';

const levelLabels: Record<string, string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [courseRes, lessonsRes, reviewsRes] = await Promise.all([
          supabase.from('courses').select('*, categories(id, name_ar)').eq('id', id).maybeSingle(),
          supabase.from('lessons').select('*').eq('course_id', id).eq('is_published', true).order('order_index'),
          supabase.from('course_reviews').select('*, profiles(full_name, avatar_url)').eq('course_id', id).order('created_at', { ascending: false }).limit(5),
        ]);
        setCourse(courseRes.data as Course);
        setLessons(Array.isArray(lessonsRes.data) ? (lessonsRes.data as Lesson[]) : []);
        setReviews(Array.isArray(reviewsRes.data) ? (reviewsRes.data as CourseReview[]) : []);
      } catch (err) {
        console.error('CourseDetailPage fetch error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', id)
      .eq('status', 'active')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.warn('enrollment check error:', error.message);
        else setIsEnrolled(!!data);
      });
  }, [user, id]);

  const handleEnroll = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/checkout/${id}`);
  };

  const handleStartLearning = () => {
    if (lessons.length > 0) {
      navigate(`/learn/${id}/${lessons[0].id}`);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="h-8 bg-muted rounded animate-pulse w-64 mb-4" />
          <div className="h-4 bg-muted rounded animate-pulse w-full mb-2" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        </div>
      </PublicLayout>
    );
  }

  if (!course) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 md:px-6 py-20 text-center">
          <p className="text-muted-foreground">الكورس غير موجود</p>
          <Button asChild className="mt-4"><Link to="/courses">العودة للكورسات</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const price = course.discount_price ?? course.price;
  const hasDiscount = course.discount_price !== null && course.discount_price < course.price;

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {course.categories && (
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                    {(course.categories as unknown as { name_ar: string }).name_ar}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {levelLabels[course.level]}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-balance">
                {course.title_ar}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-2xl">
                {course.description_ar || course.description}
              </p>

              {course.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= Math.round(course.rating) ? 'fill-warning text-warning' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                  <span className="text-foreground text-sm font-medium ltr-number">{course.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm ltr-number">({course.reviews_count} تقييم)</span>
                </div>
              )}

              <div className="flex items-center gap-4 text-muted-foreground text-sm flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span className="ltr-number">{course.duration_hours}</span> ساعة
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {course.lessons_count} درس
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span className="ltr-number">{course.students_count.toLocaleString()}</span> طالب
                </span>
                {course.instructor_name && (
                  <span>بقلم: {course.instructor_name}</span>
                )}
              </div>
            </div>

            {/* Purchase Card */}
            <div className="lg:w-72 shrink-0">
              <div className="rounded-xl border border-border bg-background p-5 sticky top-20">
                {course.thumbnail_url && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-muted">
                    <img src={course.thumbnail_url} alt={course.title_ar} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="mb-4">
                  <span className="text-2xl font-bold text-foreground ltr-number">
                    {price === 0 ? 'مجاني' : `${price} ج.م`}
                  </span>
                  {hasDiscount && (
                    <span className="text-muted-foreground text-sm line-through mr-2 ltr-number">
                      {course.price} ج.م
                    </span>
                  )}
                  {hasDiscount && (
                    <Badge className="mr-2 bg-success/10 text-success border-success/30 text-xs">
                      خصم {Math.round((1 - price / course.price) * 100)}%
                    </Badge>
                  )}
                </div>

                {isEnrolled ? (
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleStartLearning}
                  >
                    <Play className="h-4 w-4 ms-2" />
                    متابعة التعلم
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleEnroll}
                  >
                    اشترك الآن
                  </Button>
                )}

                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>وصول مدى الحياة</span>
                  </div>
                  {course.certificate_enabled && (
                    <div className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5" />
                      <span>شهادة إتمام</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{course.lessons_count} درس تعليمي</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0 space-y-8">
            {/* What you'll learn */}
            {Array.isArray(course.what_you_learn) && course.what_you_learn.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">ماذا ستتعلم؟</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 rounded-xl border border-border bg-card">
                  {course.what_you_learn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            {lessons.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">
                  محتوى الكورس ({lessons.length} درس)
                </h2>
                <div className="border border-border rounded-xl overflow-hidden bg-card">
                  {lessons.map((lesson, i) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center gap-3 px-4 py-3 text-sm ${i > 0 ? 'border-t border-border' : ''}`}
                    >
                      <div className="shrink-0">
                        {lesson.is_preview ? (
                          <Play className="h-4 w-4 text-primary" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="flex-1 text-foreground truncate">{lesson.title_ar}</span>
                      <span className="text-muted-foreground text-xs shrink-0 ltr-number">
                        {lesson.duration_minutes} د
                      </span>
                      {lesson.is_preview && (
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary shrink-0">
                          مجاني
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {Array.isArray(course.requirements) && course.requirements.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">المتطلبات</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">تقييمات الطلاب</h2>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="p-4 rounded-xl border border-border bg-card">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                          {(review.profiles as unknown as { full_name: string })?.full_name?.charAt(0) || 'م'}
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-medium">
                            {(review.profiles as unknown as { full_name: string })?.full_name || 'طالب'}
                          </p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-warning text-warning" />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
