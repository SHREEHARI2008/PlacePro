import React, { useState } from 'react';
import { Search, Filter, Code2, GraduationCap, CheckCircle2, UserCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function CandidateShortlistTable({
  applications = [],
  onUpdateStatus,
  updatingId,
}) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      (app.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.studentRoll || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.companyName || '').toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || app.studentDepartment === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-[#0f172a]">Candidate Shortlisting & Pipeline Registry</h3>
          <p className="text-xs text-slate-500">
            Real-time candidate shortlisting data table with sticky header, live search, and hiring stage controls.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
          Filtered Candidates: <span className="text-[#0f172a] font-bold">{filteredApps.length}</span>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, roll no, or company..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[#cbd5e1] text-xs text-[#0f172a] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-[#cbd5e1] text-xs text-[#0f172a] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-[#cbd5e1] text-xs text-[#0f172a] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="TECHNICAL_ROUND">Technical Round</option>
            <option value="HR_ROUND">HR Round</option>
            <option value="SELECTED">Offered / Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table with Sticky Header */}
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto custom-table-scrollbar rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="sticky-table-header bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 text-[12px] font-semibold tracking-[0.05em] uppercase text-[#64748b]">Candidate Name</th>
              <th className="py-3 px-4 text-[12px] font-semibold tracking-[0.05em] uppercase text-[#64748b]">Department</th>
              <th className="py-3 px-4 text-[12px] font-semibold tracking-[0.05em] uppercase text-[#64748b]">Target Company</th>
              <th className="py-3 px-4 text-[12px] font-semibold tracking-[0.05em] uppercase text-[#64748b]">CGPA & LeetCode</th>
              <th className="py-3 px-4 text-[12px] font-semibold tracking-[0.05em] uppercase text-[#64748b]">Current Stage</th>
              <th className="py-3 px-4 text-[12px] font-semibold tracking-[0.05em] uppercase text-[#64748b] text-right">Shortlist Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9] bg-white">
            {filteredApps.map((app) => (
              <tr key={app.id} className="hover:bg-[#f8fafc] transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-[#0f172a] text-xs">{app.studentName}</div>
                  <div className="text-slate-500 text-[11px] font-mono">{app.studentRoll}</div>
                </td>

                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {app.studentDepartment || 'CSE'}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <div className="font-semibold text-[#0f172a]">{app.companyName}</div>
                  <div className="text-[#15803d] text-[11px] font-semibold">{app.packageLpa} LPA</div>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#0f172a]">{app.studentCgpa || '8.50'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-700 font-semibold flex items-center space-x-1">
                      <Code2 className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>{app.studentLeetcodeTotalSolved || 0}</span>
                    </span>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <StatusBadge status={app.status} />
                </td>

                <td className="py-3 px-4 text-right">
                  <select
                    value={app.status}
                    disabled={updatingId === app.id}
                    onChange={(e) =>
                      onUpdateStatus && onUpdateStatus(app.id, e.target.value, app.mentorRemarks)
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer"
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="SHORTLISTED">Shortlist</option>
                    <option value="TECHNICAL_ROUND">Technical Round</option>
                    <option value="HR_ROUND">HR Round</option>
                    <option value="SELECTED">Grant Offer</option>
                    <option value="REJECTED">Reject</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredApps.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            No candidates matched the specified search query or filters.
          </div>
        )}
      </div>
    </div>
  );
}
