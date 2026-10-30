import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentNavbar from './StudentNavbar';
import FloatingChatButton from './FloatingChatButton';

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex selection:bg-[#2563eb] selection:text-white">
      {/* Student Sidebar */}
      <StudentSidebar />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Student Navbar */}
        <StudentNavbar />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating Action Button */}
      <FloatingChatButton />
    </div>
  );
}
