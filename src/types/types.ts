// Platform types matching database schema

export type UserRole = 'user' | 'admin' | 'super_admin' | 'instructor';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'unpublished';
export type VideoType = 'upload' | 'external' | 'hls';
export type VideoStatus = 'processing' | 'ready' | 'hidden';
export type EnrollmentStatus = 'pending' | 'active' | 'expired' | 'cancelled' | 'rejected';
export type SubscriptionStatus = 'pending_approval' | 'active' | 'rejected' | 'expired' | 'cancelled';
export type CouponType = 'percentage' | 'fixed';
export type PaymentMethod = 'vodafone_cash' | 'instapay' | 'bank_transfer' | 'paymob' | 'fawry' | 'stripe' | 'manual';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded' | 'needs_info';
export type TicketStatus = 'open' | 'pending' | 'closed';

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_ar: string;
  icon: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  title_ar: string;
  title_en?: string | null;
  description: string | null;
  description_ar: string | null;
  description_en?: string | null;
  thumbnail_url: string | null;
  cover_image_url?: string | null;
  intro_video_url: string | null;
  price: number;
  discount_price: number | null;
  level: CourseLevel;
  status: CourseStatus;
  category_id: string | null;
  category?: string | null;
  instructor_id: string | null;
  instructor_name: string | null;
  duration_hours: number;
  lessons_count: number;
  students_count: number;
  rating: number;
  reviews_count: number;
  what_you_learn: string[];
  requirements: string[];
  target_audience: string[];
  learning_outcomes?: string[];
  certificate_enabled: boolean;
  is_featured?: boolean;
  is_free?: boolean;
  created_at: string;
  updated_at: string;
  // joined
  categories?: Category;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  title_ar: string;
  title_en?: string | null;
  description: string | null;
  description_ar: string | null;
  order_index: number;
  order_number?: number;
  duration_minutes: number;
  is_preview: boolean;
  is_free_preview?: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // joined
  videos?: Video[];
  attachments?: Attachment[];
}

export interface Video {
  id: string;
  lesson_id: string | null;
  title: string;
  video_type: VideoType;
  video_url: string;
  hls_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number;
  status: VideoStatus;
  watermark_enabled: boolean;
  watermark_text?: string | null;
  signed_url_expiry: number;
  created_at: string;
  updated_at: string;
}

// Alias for compatibility
export type VideoLesson = Video;

export interface Attachment {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  is_downloadable: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  expires_at: string | null;
  // joined
  courses?: Course;
}

export interface LessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  watch_time_seconds: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  coupon_type: CouponType;
  discount_type?: CouponType;
  discount_value: number;
  usage_limit: number | null;
  max_uses?: number | null;
  usage_count: number;
  uses_count?: number;
  expires_at: string | null;
  is_active: boolean;
  applicable_courses: string[];
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  course_id: string;
  amount: number;
  original_amount: number | null;
  coupon_id: string | null;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_ref: string | null;
  receipt_url: string | null;
  notes: string | null;
  admin_notes: string | null;
  needs_info_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  courses?: Course;
  profiles?: Profile;
}

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  // joined
  courses?: Course;
  profiles?: Profile;
}

export interface SupportTicket {
  id: string;
  student_id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  // joined
  profiles?: Profile;
  ticket_replies?: TicketReply[];
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  author_id: string;
  message: string;
  created_at: string;
  // joined
  profiles?: Profile;
}

export interface Notification {
  id: string;
  recipient_id: string | null;
  title: string;
  title_ar: string;
  message: string;
  message_ar: string;
  is_read: boolean;
  course_id: string | null;
  created_at: string;
}

export interface CourseReview {
  id: string;
  student_id: string;
  course_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // joined
  profiles?: Profile;
}

export interface Quiz {
  id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  title_ar: string;
  questions: QuizQuestion[];
  pass_score: number;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

export interface StudentNote {
  id: string;
  student_id: string;
  lesson_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// ─── New extended types ───────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  student_id: string;
  course_id: string;
  payment_id: string | null;
  status: SubscriptionStatus;
  admin_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  profiles?: Profile;
  courses?: Course;
  payments?: Payment;
}

export interface Permission {
  id: string;
  key: string;
  label_ar: string;
  group_ar: string;
  created_at: string;
}

export interface RolePermission {
  role: string;
  permission_key: string;
}

export interface UserPermission {
  user_id: string;
  permission_key: string;
  granted: boolean;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  // joined
  profiles?: Profile;
}

export interface PlatformSetting {
  key: string;
  value: string | null;
  label_ar: string | null;
  group_name: string | null;
  updated_at: string;
}




