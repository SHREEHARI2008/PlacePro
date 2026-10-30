import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';
import {
  Bell,
  LogOut,
  GraduationCap
} from 'lucide-react';

export default function StudentNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = user?.name || 'Student';
  const regNumber = user?.registerNumber || user?.rollNumber || '';

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200/90 px-4 md:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Branding & Role Chip */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm tracking-tight text-slate-900">PlacePro</span>
          <span className="text-slate-300">/</span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#2563eb] border border-blue-200 flex items-center space-x-1">
            <GraduationCap className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>Student Portal</span>
          </span>
        </div>
      </div>

      {/* Right: Notifications, Student Profile Snippet & Logout Button */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Real-time Notifications Bell with Badge */}
        <NotificationPanel />

        <div className="h-5 w-px bg-slate-200" />

        {/* Profile Link Button (Profile icon/avatar removed per requirements) */}
        <Link
          to="/student/profile"
          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors group"
          title="View Student Profile"
        >
          <div className="text-left hidden sm:block">
            <div className="font-bold text-xs text-slate-900 leading-tight group-hover:text-[#2563eb] transition-colors">
              {displayName}
            </div>
            {regNumber && (
              <div className="text-[10.5px] font-mono text-slate-500 leading-tight">
                {regNumber}
              </div>
            )}
          </div>
        </Link>

        <div className="h-5 w-px bg-slate-200" />

        {/* Explicit Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all active:scale-95"
          title="Sign out of PlacePro"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
