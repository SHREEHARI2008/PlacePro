import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Bell,
  ShoppingCart,
  ChevronDown,
  User,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Shield,
  UserCheck
} from 'lucide-react';

import NotificationPanel from './NotificationPanel';

export default function Navbar({ activeTab, setActiveTab, currentRoleView, setCurrentRoleView }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.name || 'PRITHIGA A';
  const avatar = user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between shadow-xs">
      {/* Search Input Bar (Pill) */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/30 focus:border-[#1a5cff] transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4 md:space-x-5">
        {/* Real-time Notification Panel */}
        <NotificationPanel />

        {/* Shopping Cart */}
        <button
          type="button"
          className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Course Cart"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>

        {/* User Snippet Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <img
              src={avatar}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs"
            />
            <span className="font-bold text-xs text-slate-800 tracking-wide uppercase hidden sm:inline">
              {displayName}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {/* Popover Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="font-bold text-slate-900">{displayName}</div>
                <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 flex items-center space-x-2 hover:bg-slate-50 text-slate-700"
                >
                  <User className="w-4 h-4 text-[#1a5cff]" />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('dashboard');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 flex items-center space-x-2 hover:bg-slate-50 text-slate-700"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  <span>Dashboard</span>
                </button>
              </div>

              {/* Role Switcher in Dropdown */}
              <div className="border-t border-slate-100 px-4 py-2 bg-slate-50/70">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  Portal View
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRoleView('STUDENT');
                      setActiveTab('dashboard');
                      setDropdownOpen(false);
                    }}
                    className={`py-1 px-2 rounded font-semibold text-center ${
                      currentRoleView === 'STUDENT' ? 'bg-[#1a5cff] text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRoleView('MENTOR');
                      setActiveTab('dashboard');
                      setDropdownOpen(false);
                    }}
                    className={`py-1 px-2 rounded font-semibold text-center ${
                      currentRoleView === 'MENTOR' ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Mentor Hub
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 flex items-center space-x-2 hover:bg-red-50 text-red-600 font-medium"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
