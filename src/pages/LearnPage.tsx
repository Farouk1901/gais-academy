import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layouts/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  CheckCircle, Circle, Lock, Play,
  BookOpen, Clock, ShieldAlert, ArrowRight, RefreshCw, AlertTriangle
} from 'lucide-react';
import type { Course, Lesson } from '@/types/types';

// Metadata-only shape returned by student_video_meta view (no raw URL)
type VideoMeta = {
  id: string;
  lesson_id: string;
  title: string | null;
  title_ar: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  watermark_enabled: boolean;
  watermark_text: string | null;
  is_protected: boolean;
  disable_download: boolean;
  is_published: boolean;
  source_type: 'storage' | 'hls' | 'external' | 'none';
};

// Signed URL response from Edge Function
type SignedVideoResponse = {
  url: string;
  source_type: 'signed' | 'hls' | 'external';
  expires_at: string;
  expires_in_seconds: number;
  watermark_text: string | null;
  disable_download: boolean;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  title_ar: string | null;
};

type LessonWithMeta = Lesson & { video_meta?: VideoMeta };
type EnrollmentRow = {
  status: string;
  progress_percentage: number;
  last_watched_lesson_id: string | null;
  completed_lessons: string[];
};

// Refresh signed URL 5 minutes before expiry
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export default function LearnPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<LessonWithMeta[]>([]);
  const [enrollment, setEnrollment] = useState<EnrollmentRow | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonWithMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessMessage, setAccessMessage] = useState('');

  // Signed URL state
  const [signedVideo, setSignedVideo] = useState<SignedVideoResponse | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Auto-refresh timer ref
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch signed URL from Edge Function ───────────────────────────────
  const fetchSignedUrl = useCallback(async (videoId: string, lessonId: string) => {
    setUrlLoading(true);
    setUrlError(null);

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const { data, error } = await supabase.functions.invoke<SignedVideoResponse>(
      `get-video-url?video_id=${encodeURIComponent(videoId)}&lesson_id=${encodeURIComponent(lessonId)}`,
      { method: 'GET' },
    );

    if (error || !data?.url) {
      const errText = error ? await error.context?.text?.() : null;
      setUrlError(errText || 'تعذّر تحميل الفيديو، يرجى المحاولة مرة أخرى');
      setSignedVideo(null);
      setUrlLoading(false);
      return;
    }

    setSignedVideo(data);
    setUrlLoading(false);

    // Schedule auto-refresh before URL expires
    const expiresAt = new Date(data.expires_at).getTime();
    const refreshIn = Math.max(0, expiresAt - Date.now() - REFRESH_BUFFER_MS);
    refreshTimerRef.current = setTimeout(() => {
      fetchSignedUrl(videoId, lessonId);
    }, refreshIn);
  }, []);

  useEffect(() => {
    return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
  }, []);

  // ── Load lesson data (metadata only — no raw URLs) ────────────────────
  useEffect(() => {
    if (!courseId || !profile) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
      const [{ data: c }, { data: ls }, { data: enroll }, { data: sub }] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).maybeSingle(),
        supabase.from('lessons')
          .select('id, title, title_ar, description, description_ar, duration_minutes, order_index, order_number, is_published, is_preview, is_free_preview, course_id')
          .eq('course_id', courseId)
          .eq('is_published', true)
          .order('order_index'),
        supabase.from('enrollments')
          .select('status, progress_percentage, last_watched_lesson_id, completed_lessons')
          .eq('student_id', profile.id).eq('course_id', courseId).maybeSingle(),
        supabase.from('subscriptions')
          .select('status')
          .eq('student_id', profile.id).eq('course_id', courseId).eq('status', 'active').maybeSingle(),
      ]);

      setCourse(c as Course || null);
      const lessonList = (ls || []) as LessonWithMeta[];
      setLessons(lessonList);

      // Fetch video metadata separately from the secure view
      const lessonIds = lessonList.map(l => l.id);
      let videoMetaMap: Record<string, VideoMeta> = {};
      if (lessonIds.length > 0) {
        const { data: vmRows } = await supabase
          .from('student_video_meta')
          .select('*')
          .in('lesson_id', lessonIds)
          .eq('is_published', true);
        if (vmRows) {
          videoMetaMap = Object.fromEntries(
            (vmRows as VideoMeta[]).map(v => [v.lesson_id, v])
          );
        }
      }
      const enriched: LessonWithMeta[] = lessonList.map(l => ({
        ...l,
        video_meta: videoMetaMap[l.id],
      }));
      setLessons(enriched);

      // Admin always has access
      const userIsAdmin = profile.role === 'admin' || profile.role === 'super_admin';
      const isFree = (c as Course & { is_free?: boolean })?.is_free;

      if (userIsAdmin || isFree) {
        setHasAccess(true);
        if (enroll) setEnrollment(enroll as EnrollmentRow);
        const lastId = (enroll as EnrollmentRow | null)?.last_watched_lesson_id;
        const startLesson = lastId ? enriched.find(l => l.id === lastId) ?? enriched[0] : enriched[0];
        if (startLesson) setActiveLesson(startLesson);
      } else if (sub?.status === 'active') {
        setHasAccess(true);
        if (enroll) {
          setEnrollment(enroll as EnrollmentRow);
          const lastId = (enroll as EnrollmentRow).last_watched_lesson_id;
          const startLesson = lastId ? enriched.find(l => l.id === lastId) ?? enriched[0] : enriched[0];
          if (startLesson) setActiveLesson(startLesson);
        } else {
          // Active subscription but no enrollment — start from first lesson
          if (enriched.length) setActiveLesson(enriched[0]);
        }
      } else if (sub) {
        setHasAccess(false);
        setAccessMessage('الاشتراك قيد المراجعة. يرجى الانتظار حتى يتم التفعيل.');
      } else {
        setHasAccess(false);
        setAccessMessage('ليس لديك صلاحية الوصول لهذا الكورس. تأكد من اشتراكك أو تواصل مع الدعم.');
      }
      } catch (err) {
        console.error('LearnPage fetchAll error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [courseId, profile]);

  // ── Helper: convert YouTube/Vimeo watch URLs to embed URLs ─────────────
  const toEmbedUrl = (url: string): string => {
    // YouTube: youtube.com/watch?v=xxx or youtu.be/xxx
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    // Vimeo: vimeo.com/xxx
    const vmMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}?title=0&byline=0&portrait=0`;
    return url;
  };

  // ── Fetch signed URL when active lesson changes ───────────────────────
  useEffect(() => {
    if (!activeLesson) { setSignedVideo(null); return; }
    const vm = activeLesson.video_meta;
    if (!vm || vm.source_type === 'none' || !vm.is_published) {
      setSignedVideo(null);
      return;
    }
    // For external videos (YouTube, Vimeo), bypass Edge Function — embed directly
    if (vm.source_type === 'external') {
      // Fetch video_url directly from videos table (safe for external links)
      supabase.from('videos').select('video_url').eq('id', vm.id).maybeSingle().then(({ data }) => {
        if (data?.video_url) {
          const embedUrl = toEmbedUrl(data.video_url);
          setSignedVideo({
            url: embedUrl,
            source_type: 'external',
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            expires_in_seconds: 86400,
            watermark_text: vm.watermark_text,
            disable_download: vm.disable_download,
            duration_seconds: vm.duration_seconds,
            thumbnail_url: vm.thumbnail_url,
            title_ar: vm.title_ar,
          });
        } else {
          setUrlError('لم يتم العثور على رابط الفيديو');
        }
      });
      return;
    }
    // For storage/HLS, use Edge Function
    fetchSignedUrl(vm.id, activeLesson.id);
  }, [activeLesson, fetchSignedUrl]);

  const markComplete = async (lessonId: string) => {
    if (!profile || !courseId || !enrollment) return;
    const completed = Array.isArray(enrollment.completed_lessons) ? enrollment.completed_lessons : [];
    if (completed.includes(lessonId)) return;
    const newCompleted = [...completed, lessonId];
    const progress = Math.round((newCompleted.length / lessons.length) * 100);
    try {
      const { error } = await supabase.from('enrollments').update({
        completed_lessons: newCompleted,
        progress_percentage: progress,
        last_watched_lesson_id: lessonId,
        ...(progress === 100 ? { completed_at: new Date().toISOString(), status: 'completed' } : {}),
      }).eq('student_id', profile.id).eq('course_id', courseId);
      if (error) throw error;
      setEnrollment(prev => prev ? { ...prev, completed_lessons: newCompleted, progress_percentage: progress } : prev);
      if (progress === 100) toast.success('🎉 أحسنت! أكملت الكورس بنجاح');
    } catch (err) {
      console.error('markComplete error:', err);
      toast.error('تعذّر تحديث التقدم');
    }
  };

  const selectLesson = (lesson: LessonWithMeta) => {
    const isLocked = !hasAccess && !lesson.is_free_preview && !lesson.is_preview;
    if (isLocked) return;
    setActiveLesson(lesson);
    if (profile && courseId) {
      supabase.from('enrollments').update({ last_watched_lesson_id: lesson.id })
        .eq('student_id', profile.id).eq('course_id', courseId)
        .then(({ error }) => { if (error) console.warn('selectLesson track error:', error.message); });
    }
  };

  const completedLessons = enrollment?.completed_lessons || [];
  const progress = enrollment?.progress_percentage || 0;

  // ────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-8 w-64 bg-muted" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="lg:col-span-2 h-96 bg-muted rounded-lg" />
          <Skeleton className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!course) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">الكورس غير موجود</p>
    </div>
  );

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="stat-card max-w-sm w-full text-center">
          <CardContent className="p-8">
            <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground font-cairo mb-2">الوصول مقيّد</h2>
            <p className="text-sm text-muted-foreground mb-4">{accessMessage}</p>
            <div className="space-y-2">
              <Link to={`/checkout/${courseId}`}>
                <Button className="w-full">اشترك الآن</Button>
              </Link>
              <Button variant="ghost" onClick={() => navigate(-1)}
                className="w-full border border-border text-foreground hover:bg-accent">رجوع</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <Link to="/dashboard/courses">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-foreground hover:bg-accent">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate font-cairo">{course.title_ar}</h1>
          {lessons.length > 0 && (
            <div className="flex items-center gap-2 mt-0.5">
              <Progress value={progress} className="h-1.5 flex-1 max-w-24" />
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
          )}
        </div>
        <Badge variant="outline" className="text-xs border border-success/20 bg-success/10 text-success shrink-0">
          <ShieldAlert className="w-3 h-3 ml-1" />محتوى محمي
        </Badge>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-57px)]">
        {/* ── Video area ── */}
        <div className="flex-1 min-w-0 flex flex-col bg-background">
          {activeLesson ? (
            <div className="flex-1 flex flex-col">
              <div className="relative bg-black aspect-video w-full overflow-hidden">
                {/* Loading */}
                {urlLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                    <div className="text-center text-white/60">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs">جاري تحميل الفيديو المحمي...</p>
                    </div>
                  </div>
                )}

                {/* Error */}
                {urlError && !urlLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                    <div className="text-center text-white/60 p-4">
                      <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-warning" />
                      <p className="text-sm mb-3">{urlError}</p>
                      <Button size="sm" variant="ghost"
                        className="border border-white/40 text-white hover:bg-white/10"
                        onClick={() => {
                          const vm = activeLesson.video_meta;
                          if (vm) fetchSignedUrl(vm.id, activeLesson.id);
                        }}>
                        <RefreshCw className="w-3.5 h-3.5 ml-1.5" />إعادة المحاولة
                      </Button>
                    </div>
                  </div>
                )}

                {/* Video */}
                {signedVideo && !urlLoading && !urlError && (
                  <div className="relative w-full h-full">
                    {signedVideo.source_type === 'external' &&
                     (signedVideo.url.includes('youtube.com') ||
                      signedVideo.url.includes('youtu.be') ||
                      signedVideo.url.includes('vimeo.com')) ? (
                      <iframe
                        key={activeLesson.id}
                        src={signedVideo.url}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    ) : (
                      <video
                        key={activeLesson.id}
                        className="w-full h-full object-contain"
                        controls
                        controlsList={signedVideo.disable_download ? 'nodownload' : undefined}
                        onContextMenu={e => e.preventDefault()}
                        playsInline
                        src={signedVideo.url}
                        poster={signedVideo.thumbnail_url ?? undefined}
                      >
                        متصفحك لا يدعم تشغيل الفيديو
                      </video>
                    )}

                    {/* Personalised watermark */}
                    {signedVideo.watermark_text && (
                      <div className="absolute inset-0 pointer-events-none select-none z-10 flex items-end justify-end p-4">
                        <span className="text-white/25 text-xs font-mono bg-black/10 px-2 py-1 rounded">
                          {signedVideo.watermark_text}
                        </span>
                      </div>
                    )}

                    {/* Copyright tag */}
                    <div className="absolute top-2 right-2 pointer-events-none select-none">
                      <span className="text-white/35 text-[9px] font-mono">GAIS © أكاديمية الجوهري</span>
                    </div>

                    {/* Expiry countdown bar */}
                    <ExpiryBar expiresAt={signedVideo.expires_at} />
                  </div>
                )}

                {/* No video */}
                {!signedVideo && !urlLoading && !urlError && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white/60">
                      <BookOpen className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">هذا الدرس يحتوي على محتوى نصي فقط</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson info */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-foreground font-cairo">{activeLesson.title_ar}</h2>
                    {activeLesson.description_ar && (
                      <p className="text-sm text-muted-foreground mt-1 text-pretty">{activeLesson.description_ar}</p>
                    )}
                  </div>
                  {hasAccess && (
                    <Button
                      size="sm"
                      variant={completedLessons.includes(activeLesson.id) ? 'ghost' : 'default'}
                      className={cn('shrink-0 gap-1.5',
                        completedLessons.includes(activeLesson.id)
                          ? 'border border-success/20 bg-success/10 text-success hover:bg-success/20' : ''
                      )}
                      onClick={() => markComplete(activeLesson.id)}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {completedLessons.includes(activeLesson.id) ? 'مكتمل' : 'علّم كمكتمل'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">اختر درساً للبدء</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Lessons sidebar ── */}
        <div className="w-full lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-r border-border bg-card overflow-y-auto shrink-0">
          <div className="p-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">محتوى الكورس</p>
            <p className="text-xs text-muted-foreground mt-0.5">{completedLessons.length}/{lessons.length} درس مكتمل</p>
          </div>
          <div className="divide-y divide-border">
            {lessons.map((lesson, i) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isActive = activeLesson?.id === lesson.id;
              const isLocked = !hasAccess && !lesson.is_free_preview && !lesson.is_preview;
              return (
                <button key={lesson.id} onClick={() => selectLesson(lesson)} disabled={isLocked}
                  className={cn('w-full text-right p-3 flex items-start gap-2.5 transition-colors text-sm',
                    isActive ? 'bg-primary/10' : 'hover:bg-secondary/50',
                    isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                  )}>
                  <div className="shrink-0 mt-0.5">
                    {isLocked ? <Lock className="w-4 h-4 text-muted-foreground" /> :
                     isCompleted ? <CheckCircle className="w-4 h-4 text-success" /> :
                     isActive ? <Play className="w-4 h-4 text-primary" /> :
                     <Circle className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-medium leading-snug truncate',
                      isActive ? 'text-primary' : 'text-foreground')}>
                      {i + 1}. {lesson.title_ar}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {lesson.duration_minutes && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Clock className="w-2.5 h-2.5" />{lesson.duration_minutes} د
                        </span>
                      )}
                      {(lesson.is_free_preview || lesson.is_preview) && !hasAccess && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-info/20 text-info">مجاني</Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Expiry countdown bar ─────────────────────────────────────────────────
function ExpiryBar({ expiresAt }: { expiresAt: string }) {
  const [pct, setPct] = useState(100);
  const expiryMs = new Date(expiresAt).getTime();
  const totalMs = 3600 * 1000;

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, expiryMs - Date.now());
      setPct(Math.round((remaining / totalMs) * 100));
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, [expiresAt, expiryMs, totalMs]);

  if (pct > 17) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-black/30 z-20 pointer-events-none">
      <div
        className="h-full bg-warning/70 transition-all duration-[10000ms] ease-linear"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

