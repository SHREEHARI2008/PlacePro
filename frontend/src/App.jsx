import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import RoleGuard from './components/RoleGuard';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Layouts
import StudentLayout from './components/StudentLayout';
import MentorLayout from './components/MentorLayout';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfileView from './pages/student/StudentProfileView';
import StudentLeetCode from './pages/student/StudentLeetCode';
import AcademicPerformance from './pages/student/AcademicPerformance';
import UpcomingCompanies from './pages/student/UpcomingCompanies';
import CompanySpecificTestView from './pages/student/CompanySpecificTestView';
import SkillBooster from './pages/student/SkillBooster';

// Mentor Pages
import MentorDashboard from './pages/mentor/MentorDashboard';
import MentorProfileView from './pages/mentor/MentorProfileView';
import MenteeList from './pages/mentor/MenteeList';
import PostCompanyDrive from './pages/mentor/PostCompanyDrive';
import ApplicationReview from './pages/mentor/ApplicationReview';
import AssessmentManagement from './pages/mentor/AssessmentManagement';
import MentorSkillBooster from './pages/mentor/MentorSkillBooster';

function PublicOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    return user.role === 'MENTOR'
      ? <Navigate to="/mentor/dashboard" replace />
      : <Navigate to="/student/dashboard" replace />;
  }
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return user.role === 'MENTOR'
    ? <Navigate to="/mentor/dashboard" replace />
    : <Navigate to="/student/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Routes */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* Student Isolated Workspace */}
        <Route
          path="/student"
          element={
            <RoleGuard allowedRole="STUDENT">
              <StudentLayout />
            </RoleGuard>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfileView />} />
          <Route path="leetcode" element={<StudentLeetCode />} />
          <Route path="academics" element={<AcademicPerformance />} />
          <Route path="companies" element={<UpcomingCompanies />} />
          <Route path="company-tests" element={<CompanySpecificTestView />} />
          <Route path="labs" element={<SkillBooster />} />
          <Route path="skill-booster" element={<SkillBooster />} />
        </Route>

        {/* Mentor Isolated Workspace */}
        <Route
          path="/mentor"
          element={
            <RoleGuard allowedRole="MENTOR">
              <MentorLayout />
            </RoleGuard>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MentorDashboard />} />
          <Route path="profile" element={<MentorProfileView />} />
          <Route path="mentees" element={<MenteeList />} />
          <Route path="skill-booster" element={<MentorSkillBooster />} />
          <Route path="post-drive" element={<PostCompanyDrive />} />
          <Route path="assessments" element={<AssessmentManagement />} />
          <Route path="applications" element={<ApplicationReview />} />
        </Route>

        {/* Root and Fallback Catch-All */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
