// Deployment trigger: 2026-02-11 (Render Backend Update)
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
const LoadingScreen = lazy(() => import('./components/LoadingScreen'));
const DocumentHead = lazy(() => import('./components/DocumentHead'));
const ErrorBoundary = lazy(() => import('./components/common/ErrorBoundary'));
const Navbar = lazy(() => import('./components/Navbar'));
const Footer = lazy(() => import('./components/Footer'));
const HomePage = lazy(() => import('./components/pages/HomePage'));
const SubjectsPage = lazy(() => import('./components/pages/SubjectsPage'));
const SectionsPage = lazy(() => import('./components/pages/SectionsPage'));
const LessonsListPage = lazy(() => import('./components/pages/LessonsListPage'));
const LessonPage = lazy(() => import('./components/pages/LessonPage'));
const QuestionPage = lazy(() => import('./components/pages/QuestionPage'));
const PricingPage = lazy(() => import('./components/pages/PricingPage'));
const LoginPage = lazy(() => import('./components/pages/LoginPage'));
const SignupPage = lazy(() => import('./components/pages/SignupPage'));
const ProfilePage = lazy(() => import('./components/pages/ProfilePage'));
const ForgotPasswordPage = lazy(() => import('./components/pages/ForgotPasswordPage'));
const PrivacyPolicyPage = lazy(() => import('./components/pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./components/pages/TermsOfServicePage'));
const SupportPage = lazy(() => import('./components/pages/SupportPage'));
const AboutPage = lazy(() => import('./components/pages/AboutPage'));
const SampleContentPage = lazy(() => import('./components/pages/SampleContentPage'));
const RefundPolicyPage = lazy(() => import('./components/pages/RefundPolicyPage'));
const ContactUsPage = lazy(() => import('./components/pages/ContactUsPage'));
const AdminRoute = lazy(() => import('./components/admin/AdminRoute'));
const AdminDashboard = lazy(() => import('./components/pages/admin/AdminDashboard'));
const UsersPage = lazy(() => import('./components/pages/admin/UsersPage'));
const LessonsPage = lazy(() => import('./components/pages/admin/LessonsPage'));
const NotesPage = lazy(() => import('./components/pages/admin/NotesPage'));
const QuestionsPage = lazy(() => import('./components/pages/admin/QuestionsPage'));
const ImagesPage = lazy(() => import('./components/pages/admin/ImagesPage'));
const PricingPageAdmin = lazy(() => import('./components/pages/admin/PricingPage'));
const AIConfigPage = lazy(() => import('./components/pages/admin/AIConfigPage'));
const AdminSubjectsPage = lazy(() => import('./components/pages/admin/SubjectsPage'));
const SettingsPage = lazy(() => import('./components/pages/admin/SettingsPage'));


export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

function AppContent() {
  const [loading, setLoading] = useState(true);
  const { settings, loading: settingsLoading } = useSettings();

  useEffect(() => {
    if (!settingsLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500); // Reduced to 500ms for quick entry but smooth transition
      return () => clearTimeout(timer);
    }
  }, [settingsLoading]);

  return (
    <>
      <DocumentHead />
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingScreen key="loading" settings={settings} />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Suspense fallback={<LoadingScreen settings={settings} />}>
              <ErrorBoundary>
                <AuthProvider>
                  <AppShell />
                  <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                  />
                </AuthProvider>
              </ErrorBoundary>
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Admin routes have their own layout, so don't wrap them
  if (isAdminRoute) {
    return (
      <Routes location={location}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/subjects/:subjectId" element={<SectionsPage />} />
        <Route path="/subjects/:subjectId/lessons" element={<LessonsListPage />} />
        <Route path="/subjects/:subjectId/:sectionId" element={<LessonsListPage />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/lesson/:lessonId/questions" element={<QuestionPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/sample-content" element={<SampleContentPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/contact" element={<ContactUsPage />} />

        {/* Protected Admin Routes - No separate login, use main /login */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
        <Route path="/admin/lessons" element={<AdminRoute><LessonsPage /></AdminRoute>} />
        <Route path="/admin/notes" element={<AdminRoute><NotesPage /></AdminRoute>} />
        <Route path="/admin/questions" element={<AdminRoute><QuestionsPage /></AdminRoute>} />
        <Route path="/admin/images" element={<AdminRoute><ImagesPage /></AdminRoute>} />
        <Route path="/admin/pricing" element={<AdminRoute><PricingPageAdmin /></AdminRoute>} />
        <Route path="/admin/ai-config" element={<AdminRoute><AIConfigPage /></AdminRoute>} />
        <Route path="/admin/subjects" element={<AdminRoute><AdminSubjectsPage /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />

        {/* Redirect /admin to dashboard or login based on auth */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Regular routes with Navbar and Footer
  return (
    <div
      className="min-h-screen text-white flex flex-col"
      style={{
        background: "#0B0B0D",
      }}
    >
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          className="flex-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/subjects/:subjectId" element={<SectionsPage />} />
            <Route path="/subjects/:subjectId/lessons" element={<LessonsListPage />} />
            <Route path="/subjects/:subjectId/:sectionId" element={<LessonsListPage />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/lesson/:lessonId/questions" element={<QuestionPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/sample-content" element={<SampleContentPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}