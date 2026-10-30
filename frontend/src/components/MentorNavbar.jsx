import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';
import {
  Bell,
  LogOut,
  Shield,
  Briefcase
} from 'lucide-react';

export default function MentorNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = user?.name || 'Faculty Mentor';
  const staffId = user?.mentorStaffId || 'Faculty';
  const designation = user?.designation || 'Placement Mentor';
  const avatar = user?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200/90 px-4 md:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Branding & Role Chip */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm tracking-tight text-slate-900">PlacePro</span>
          <span className="text-slate-300">/</span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Faculty Mentor Hub</span>
          </span>
        </div>
      </div>

      {/* Right: Notifications, Mentor Profile Snippet & Logout Button */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Real-time Notifications Bell with Badge */}
        <NotificationPanel />

        <div className="h-5 w-px bg-slate-200" />

        {/* Mentor Profile Link Button */}
        <Link
          to="/mentor/profile"
          className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors group"
          title="View Mentor Profile"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-xs">
            <img
              src={avatar}
              alt={displayName}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="text-left hidden sm:block">
            <div className="font-bold text-xs text-slate-900 leading-tight group-hover:text-amber-700 transition-colors">
              {displayName}
            </div>
            <div className="text-[10.5px] font-medium text-slate-500 leading-tight flex items-center space-x-1">
              <span>{designation}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-amber-700 font-semibold">{staffId}</span>
            </div>
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
