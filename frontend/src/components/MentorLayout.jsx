import React from 'react';
import { Outlet } from 'react-router-dom';
import MentorSidebar from './MentorSidebar';
import MentorNavbar from './MentorNavbar';

export default function MentorLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex selection:bg-amber-600 selection:text-white">
      {/* Mentor Sidebar */}
      <MentorSidebar />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mentor Navbar */}
        <MentorNavbar />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
