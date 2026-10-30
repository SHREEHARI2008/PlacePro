import React from 'react';
import {
  LayoutGrid,
  BookOpen,
  Laptop,
  ClipboardList,
  FileCheck,
  MoreHorizontal,
  GraduationCap
} from 'lucide-react';
import msecBadge from '../assets/msec-badge.svg';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'labs', label: 'Labs', icon: Laptop },
    { id: 'assessments', label: 'Assessments', icon: ClipboardList },
    { id: 'company_tests', label: 'Company Specific Test', icon: FileCheck },
  ];

  return (
    <aside className="w-[90px] md:w-[94px] bg-[#0b1940] shrink-0 min-h-screen flex flex-col items-center justify-between py-4 select-none z-30 shadow-md">
      <div className="w-full flex flex-col items-center space-y-5">
        {/* College Emblem Crest Badge */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="cursor-pointer group flex flex-col items-center"
          title="ABC College Campus Placement"
        >
          <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-sm border border-slate-200/40 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <img 
              src={msecBadge} 
              alt="ABC College Crest" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="w-full px-2 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-150 group text-center ${
                  isActive
                    ? 'bg-[#1a5cff] text-white shadow-md shadow-[#1a5cff]/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                <span className={`text-[10.5px] leading-tight font-medium tracking-tight px-1 text-center ${isActive ? 'font-semibold text-white' : 'text-slate-300'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer More Options */}
      <div className="w-full px-2 flex flex-col items-center space-y-3 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          title="Account Profile"
          className={`w-full py-2 rounded-xl flex flex-col items-center justify-center transition-all ${
            activeTab === 'profile'
              ? 'bg-[#1a5cff] text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
