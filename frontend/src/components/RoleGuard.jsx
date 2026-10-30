import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Strict Role Guard ensuring workspace isolation between Student and Mentor.
 */
export default function RoleGuard({ allowedRole, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-8 h-8 border-3 border-[#2563eb] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1. Unauthenticated users are redirected to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = (user.role || '').toUpperCase();
  const targetRole = (allowedRole || '').toUpperCase();

  // 2. Strict Role Isolation:
  // Student attempting /mentor/* -> redirect to /student/dashboard
  if (targetRole === 'MENTOR' && userRole === 'STUDENT') {
    console.warn('Access denied: Student attempted to access Mentor workspace. Redirecting to /student/dashboard.');
    return <Navigate to="/student/dashboard" replace />;
  }

  // Mentor attempting /student/* -> redirect to /mentor/dashboard
  if (targetRole === 'STUDENT' && userRole === 'MENTOR') {
    console.warn('Access denied: Mentor attempted to access Student workspace. Redirecting to /mentor/dashboard.');
    return <Navigate to="/mentor/dashboard" replace />;
  }

  return children;
}
