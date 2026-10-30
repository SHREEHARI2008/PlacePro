import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Code2,
  GraduationCap,
  Building2,
  Laptop,
  FileCheck,
  User,
  Zap
} from 'lucide-react';
import msecBadge from '../assets/msec-badge.svg';

export default function StudentSidebar() {
  const navItems = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/student/leetcode', label: 'LeetCode', icon: Code2 },
    { to: '/student/academics', label: 'Academics', icon: GraduationCap },
    { to: '/student/companies', label: 'Drives', icon: Building2 },
    { to: '/student/company-tests', label: 'Assessments', icon: FileCheck },
    { to: '/student/labs', label: 'Skill Boost', icon: Zap },
  ];

  return (
    <aside className="w-[88px] md:w-[92px] bg-[#0b1940] shrink-0 min-h-screen flex flex-col items-center justify-between py-4 select-none z-30 shadow-md">
      <div className="w-full flex flex-col items-center space-y-5">
        {/* College Crest Badge */}
        <NavLink
          to="/student/dashboard"
          className="group flex flex-col items-center"
          title="PlacePro Student Portal"
        >
          <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-sm border border-slate-200/40 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <img 
              src={msecBadge} 
              alt="College Crest" 
              className="w-full h-full object-contain"
            />
          </div>
        </NavLink>

        {/* Navigation Items */}
        <nav className="w-full px-2 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `w-full py-2.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-150 group text-center ${
                    isActive
                      ? 'bg-[#1a5cff] text-white shadow-md shadow-[#1a5cff]/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-1 transition-transform group-hover:scale-110" />
                <span className="text-[10px] leading-tight tracking-tight px-1 text-center">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Button */}
      <div className="w-full px-2 flex flex-col items-center space-y-2 pb-2">
        <NavLink
          to="/student/profile"
          title="My Academic Profile"
          className={({ isActive }) =>
            `w-full py-2.5 rounded-xl flex flex-col items-center justify-center transition-all ${
              isActive
                ? 'bg-[#1a5cff] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Profile</span>
        </NavLink>
      </div>
    </aside>
  );
}
