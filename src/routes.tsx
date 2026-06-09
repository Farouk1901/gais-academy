import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { RouteGuard } from '@/components/common/RouteGuard';

// Public pages
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ServicesPage from './pages/ServicesPage';
import BlogPage from './pages/BlogPage';
import TestimonialsPage from './pages/TestimonialsPage';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Student dashboard pages
import StudentDashboard from './pages/dashboard/StudentDashboard';
import MyCoursesPage from './pages/dashboard/MyCoursesPage';
import CertificatesPage from './pages/dashboard/CertificatesPage';
import PaymentsPage from './pages/dashboard/PaymentsPage';
import SupportPage from './pages/dashboard/SupportPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import SubscriptionStatusPage from './pages/dashboard/SubscriptionStatusPage';

// Learning
import LearnPage from './pages/LearnPage';
import CheckoutPage from './pages/CheckoutPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminLessonsPage from './pages/admin/AdminLessonsPage';
import AdminVideosPage from './pages/admin/AdminVideosPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminCertificatesPage from './pages/admin/AdminCertificatesPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminSupportPage from './pages/admin/AdminSupportPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminActivityLogsPage from './pages/admin/AdminActivityLogsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminContactMessagesPage from './pages/admin/AdminContactMessagesPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  // ── Public ──────────────────────────────────────────────────────────
  { name: 'Home', path: '/', element: <HomePage />, public: true },
  { name: 'Courses', path: '/courses', element: <CoursesPage />, public: true },
  { name: 'Course Detail', path: '/courses/:id', element: <CourseDetailPage />, public: true },
  { name: 'Pricing', path: '/pricing', element: <PricingPage />, public: true },
  { name: 'About', path: '/about', element: <AboutPage />, public: true },
  { name: 'FAQ', path: '/faq', element: <FAQPage />, public: true },
  { name: 'Contact',       path: '/contact',       element: <ContactPage />,      public: true },
  { name: 'Services',      path: '/services',      element: <ServicesPage />,     public: true },
  { name: 'Blog',          path: '/blog',          element: <BlogPage />,         public: true },
  { name: 'Testimonials',  path: '/testimonials',  element: <TestimonialsPage />, public: true },
  { name: 'Terms', path: '/terms', element: <TermsPage />, public: true },
  { name: 'Privacy', path: '/privacy', element: <PrivacyPage />, public: true },

  // ── Auth ─────────────────────────────────────────────────────────────
  { name: 'Login', path: '/login', element: <LoginPage />, public: true },
  // /admin/login redirects to /login (admins use the same login page)
  { name: 'Admin Login Redirect', path: '/admin/login', element: <Navigate to="/login" replace />, public: true },
  { name: 'Register', path: '/register', element: <RegisterPage />, public: true },
  { name: 'Forgot Password', path: '/forgot-password', element: <ForgotPasswordPage />, public: true },
  { name: 'Reset Password', path: '/reset-password', element: <ResetPasswordPage />, public: true },

  // ── Protected: Student ───────────────────────────────────────────────
  {
    name: 'Student Dashboard',
    path: '/dashboard',
    element: <RouteGuard requireAuth><StudentDashboard /></RouteGuard>,
  },
  {
    name: 'My Courses',
    path: '/dashboard/courses',
    element: <RouteGuard requireAuth><MyCoursesPage /></RouteGuard>,
  },
  {
    name: 'Certificates',
    path: '/dashboard/certificates',
    element: <RouteGuard requireAuth><CertificatesPage /></RouteGuard>,
  },
  {
    name: 'Payments',
    path: '/dashboard/payments',
    element: <RouteGuard requireAuth><PaymentsPage /></RouteGuard>,
  },
  {
    name: 'Subscription Status',
    path: '/dashboard/subscription',
    element: <RouteGuard requireAuth><SubscriptionStatusPage /></RouteGuard>,
  },
  {
    name: 'Support',
    path: '/dashboard/support',
    element: <RouteGuard requireAuth><SupportPage /></RouteGuard>,
  },
  {
    name: 'Notifications',
    path: '/dashboard/notifications',
    element: <RouteGuard requireAuth><NotificationsPage /></RouteGuard>,
  },
  {
    name: 'Profile',
    path: '/dashboard/profile',
    element: <RouteGuard requireAuth><ProfilePage /></RouteGuard>,
  },
  // /dashboard/settings alias → profile
  {
    name: 'Settings',
    path: '/dashboard/settings',
    element: <Navigate to="/dashboard/profile" replace />,
  },

  // ── Protected: Learning & Checkout ───────────────────────────────────
  {
    name: 'Learn',
    path: '/learn/:courseId',
    element: <RouteGuard requireAuth><LearnPage /></RouteGuard>,
  },
  {
    name: 'Checkout',
    path: '/checkout/:courseId',
    element: <RouteGuard requireAuth><CheckoutPage /></RouteGuard>,
  },

  // ── Protected: Admin ─────────────────────────────────────────────────
  { name: 'Admin Dashboard', path: '/admin', element: <RouteGuard requireAdmin><AdminDashboard /></RouteGuard> },
  { name: 'Admin Courses', path: '/admin/courses', element: <RouteGuard requireAdmin><AdminCoursesPage /></RouteGuard> },
  { name: 'Admin Lessons', path: '/admin/lessons', element: <RouteGuard requireAdmin><AdminLessonsPage /></RouteGuard> },
  { name: 'Admin Videos', path: '/admin/videos', element: <RouteGuard requireAdmin><AdminVideosPage /></RouteGuard> },
  { name: 'Admin Students', path: '/admin/students', element: <RouteGuard requireAdmin><AdminStudentsPage /></RouteGuard> },
  { name: 'Admin Users', path: '/admin/users', element: <RouteGuard requireAdmin><AdminUsersPage /></RouteGuard> },
  { name: 'Admin Roles', path: '/admin/roles', element: <RouteGuard requireAdmin><AdminRolesPage /></RouteGuard> },
  { name: 'Admin Subscriptions', path: '/admin/subscriptions', element: <RouteGuard requireAdmin><AdminSubscriptionsPage /></RouteGuard> },
  { name: 'Admin Payments', path: '/admin/payments', element: <RouteGuard requireAdmin><AdminPaymentsPage /></RouteGuard> },
  { name: 'Admin Coupons', path: '/admin/coupons', element: <RouteGuard requireAdmin><AdminCouponsPage /></RouteGuard> },
  { name: 'Admin Certificates', path: '/admin/certificates', element: <RouteGuard requireAdmin><AdminCertificatesPage /></RouteGuard> },
  { name: 'Admin Notifications', path: '/admin/notifications', element: <RouteGuard requireAdmin><AdminNotificationsPage /></RouteGuard> },
  { name: 'Admin Contact Messages', path: '/admin/contact-messages', element: <RouteGuard requireAdmin><AdminContactMessagesPage /></RouteGuard> },
  { name: 'Admin Support', path: '/admin/support', element: <RouteGuard requireAdmin><AdminSupportPage /></RouteGuard> },
  { name: 'Admin Analytics', path: '/admin/analytics', element: <RouteGuard requireAdmin><AdminAnalyticsPage /></RouteGuard> },
  // /admin/reports alias → analytics
  { name: 'Admin Reports', path: '/admin/reports', element: <Navigate to="/admin/analytics" replace /> },
  { name: 'Admin Logs', path: '/admin/logs', element: <RouteGuard requireAdmin><AdminActivityLogsPage /></RouteGuard> },
  { name: 'Admin Settings', path: '/admin/settings', element: <RouteGuard requireAdmin><AdminSettingsPage /></RouteGuard> },
];



