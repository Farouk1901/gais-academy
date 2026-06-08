import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Signed URL expiry in seconds (60 minutes)
const SIGNED_URL_EXPIRY = 3600;

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Parse request ────────────────────────────────────────────────
    const url = new URL(req.url);
    const videoId = url.searchParams.get('video_id');
    const lessonId = url.searchParams.get('lesson_id');

    if (!videoId || !lessonId) {
      return new Response(
        JSON.stringify({ error: 'video_id and lesson_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── 2. Authenticate the caller using the JWT in Authorization header ─
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Create a client that runs as the calling user (honours RLS)
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    // Verify the JWT and get the user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── 3. Service-role client for privileged DB + Storage operations ───
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } },
    );

    // ── 4. Fetch video record (all fields, admin client) ─────────────────
    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('id, lesson_id, is_protected, is_published, video_url, hls_url, video_storage_path, watermark_enabled, watermark_text, disable_download, duration_seconds, title_ar, thumbnail_url')
      .eq('id', videoId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (videoError || !video) {
      return new Response(
        JSON.stringify({ error: 'Video not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!video.is_published) {
      return new Response(
        JSON.stringify({ error: 'Video is not published' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── 5. Get the lesson → course_id ────────────────────────────────────
    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('lessons')
      .select('id, course_id, is_free_preview')
      .eq('id', lessonId)
      .maybeSingle();

    if (lessonError || !lesson) {
      return new Response(
        JSON.stringify({ error: 'Lesson not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── 6. Check course access ───────────────────────────────────────────
    // Allow if: free preview OR admin OR active enrollment + active subscription
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    const isFreePreview = lesson.is_free_preview === true;

    if (!isAdmin && !isFreePreview) {
      // Require active subscription AND active enrollment
      const [{ data: sub }, { data: enroll }] = await Promise.all([
        supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('student_id', user.id)
          .eq('course_id', lesson.course_id)
          .eq('status', 'active')
          .maybeSingle(),
        supabaseAdmin
          .from('enrollments')
          .select('id')
          .eq('student_id', user.id)
          .eq('course_id', lesson.course_id)
          .eq('status', 'active')
          .maybeSingle(),
      ]);

      if (!sub || !enroll) {
        return new Response(
          JSON.stringify({ error: 'Access denied: no active subscription or enrollment' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    // ── 7. Get the student profile for watermark personalisation ─────────
    const { data: studentProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .maybeSingle();

    const personalizedWatermark = video.watermark_enabled
      ? (video.watermark_text || '{student_name}')
          .replace('{student_name}', studentProfile?.full_name ?? '')
          .replace('{email}', studentProfile?.email ?? '')
          .replace('{phone}', studentProfile?.phone ?? '')
      : null;

    // ── 8. Resolve the video URL ─────────────────────────────────────────
    let resolvedUrl: string | null = null;
    let sourceType: 'signed' | 'hls' | 'external' = 'external';
    let expiresAt: string | null = null;

    if (video.video_storage_path) {
      // Supabase Storage: generate signed URL valid for 60 minutes
      const { data: signed, error: signError } = await supabaseAdmin
        .storage
        .from('videos')
        .createSignedUrl(video.video_storage_path, SIGNED_URL_EXPIRY);

      if (signError || !signed?.signedUrl) {
        return new Response(
          JSON.stringify({ error: 'Failed to generate signed URL', detail: signError?.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      resolvedUrl = signed.signedUrl;
      sourceType = 'signed';
      expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY * 1000).toISOString();

    } else if (video.hls_url) {
      // HLS stream (external CDN) — access already validated above
      resolvedUrl = video.hls_url;
      sourceType = 'hls';
      expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY * 1000).toISOString();

    } else if (video.video_url) {
      // External URL (YouTube embed, CDN direct link, etc.)
      resolvedUrl = video.video_url;
      sourceType = 'external';
      expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY * 1000).toISOString();

    } else {
      return new Response(
        JSON.stringify({ error: 'No video source configured for this lesson' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── 9. Return signed response ────────────────────────────────────────
    return new Response(
      JSON.stringify({
        url: resolvedUrl,
        source_type: sourceType,
        expires_at: expiresAt,
        expires_in_seconds: SIGNED_URL_EXPIRY,
        watermark_text: personalizedWatermark,
        disable_download: video.disable_download ?? true,
        duration_seconds: video.duration_seconds,
        thumbnail_url: video.thumbnail_url,
        title_ar: video.title_ar,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          // Tell the browser not to cache this response
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );

  } catch (err) {
    console.error('[get-video-url] Unhandled error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
