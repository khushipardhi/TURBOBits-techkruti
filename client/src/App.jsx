import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/common/Toast';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard from './pages/NgoDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Role → dashboard path map
const ROLE_PATHS = {
  DONOR: '/donor',
  RECEIVER: '/ngo',
  VOLUNTEER: '/volunteer',
  ADMIN: '/admin',
};

/**
 * SessionGuard: listens for 401 events from api.js and logs the user out.
 * Must be inside AuthProvider + ToastProvider.
 */
function SessionGuard() {
  const { handleUnauthorized, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => {
      if (isAuthenticated) {
        handleUnauthorized();
        addToast('Your session has expired. Please login again.', 'error');
        navigate('/login', { replace: true });
      }
    };
    window.addEventListener('foodlink:session-expired', handler);
    return () => window.removeEventListener('foodlink:session-expired', handler);
  }, [handleUnauthorized, isAuthenticated, addToast, navigate]);

  return null;
}

/**
 * SmartLoginRoute: if user is already authenticated, redirect to their dashboard.
 */
function SmartLoginRoute({ element }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated && user?.role) {
    const path = ROLE_PATHS[user.role];
    if (path) return <Navigate to={path} replace />;
  }

  return element;
}

import { usePushNotifications } from './hooks/usePushNotifications';

function PushNotifications() {
  usePushNotifications();
  return null;
}

function AppRoutes() {
  return (
    <>
      <SessionGuard />
      <PushNotifications />
      <Navbar />
      <Routes>
        {/* Public Routes with smart redirect for logged-in users */}
        <Route path="/" element={<SmartLoginRoute element={<LandingPage />} />} />
        <Route path="/login" element={<SmartLoginRoute element={<LoginPage />} />} />
        <Route path="/register" element={<SmartLoginRoute element={<RegisterPage />} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Protected Routes */}
        <Route
          path="/donor"
          element={
            <ProtectedRoute allowedRoles={['DONOR']}>
              <DonorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo"
          element={
            <ProtectedRoute allowedRoles={['RECEIVER']}>
              <NgoDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer"
          element={
            <ProtectedRoute allowedRoles={['VOLUNTEER']}>
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['DONOR', 'RECEIVER', 'VOLUNTEER', 'ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <AppRoutes />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
