import React, { Suspense, lazy, Component } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Layout from './components/Layout/Layout.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';
import { useAuthStore } from './store/authStore.js';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const CourseCatalogPage = lazy(() => import('./pages/CourseCatalogPage.jsx'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage.jsx'));
const LearningPathsPage = lazy(() => import('./pages/LearningPathsPage.jsx'));
const LearningPathDetailPage = lazy(() => import('./pages/LearningPathDetailPage.jsx'));
const LiveSessionsPage = lazy(() => import('./pages/LiveSessionsPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const EnrollmentPage = lazy(() => import('./pages/EnrollmentPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 text-sm mb-6">This page encountered an error. Try going back or refreshing.</p>
          <Link to="/" className="btn-primary" onClick={() => this.setState({ hasError: false })}>
            Go Home
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="courses" element={<CourseCatalogPage />} />
            <Route
              path="courses/:courseId"
              element={
                <ErrorBoundary>
                  <CourseDetailPage />
                </ErrorBoundary>
              }
            />
            <Route path="learning-paths" element={<LearningPathsPage />} />
            <Route path="learning-paths/:pathId" element={<LearningPathDetailPage />} />
            <Route path="live-sessions" element={<LiveSessionsPage />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="enroll/:courseId"
              element={
                <ProtectedRoute>
                  <EnrollmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
