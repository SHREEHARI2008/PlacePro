import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { companyAPI } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  Code2
} from 'lucide-react';

export default function ApplicationReview() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialDriveId = searchParams.get('driveId');
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDrive, setSelectedDrive] = useState(initialDriveId || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const mentorId = user?.mentorId;
      const [appsRes, compsRes] = await Promise.all([
        companyAPI.getApplications(mentorId ? { mentorId } : {}),
        companyAPI.getCompanies(),
      ]);

      if (appsRes.data?.success) setApplications(appsRes.data.data || []);
      if (compsRes.data?.success) setCompanies(compsRes.data.data || []);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    const driveParam = searchParams.get('driveId');
    if (driveParam) {
      setSelectedDrive(driveParam);
    }
  }, [searchParams]);

  const handleStatusChange = async (appId, newStatus, remarks) => {
    try {
      setUpdatingId(appId);
      const res = await companyAPI.updateApplicationStatus(appId, newStatus, remarks || 'Status updated by mentor');
      if (res.data?.success) {
        setNotification(`Application status updated to ${newStatus}`);
        loadData();
      }
    } catch (err) {
      setNotification('Failed to update status');
    } finally {
      setUpdatingId(null);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(search.toLowerCase()) ||
      app.studentRoll.toLowerCase().includes(search.toLowerCase()) ||
      app.companyName.toLowerCase().includes(search.toLowerCase());

    const matchesDrive = selectedDrive === 'ALL' || String(app.driveId) === selectedDrive;
    const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus;

    return matchesSearch && matchesDrive && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div className="p-4 rounded-lg bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-slate-100 text-[#0f172a]">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-[#0f172a]">Placement Application Manager</h1>
          </div>
          <p className="text-xs text-slate-500">
            Review your assigned mentees' drive applications, inspect interview stages, and update hiring statuses.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Assigned Mentees Only
          </span>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
            Applications: <span className="text-[#0f172a] font-bold">{applications.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or company..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[#cbd5e1] text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Drive Filter */}
          <select
            value={selectedDrive}
            onChange={(e) => setSelectedDrive(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-[#cbd5e1] text-xs text-[#0f172a] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          >
            <option value="ALL">All Company Drives</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>

          {/* Status Filter */}
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
            <option value="SELECTED">Selected / Placed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="sticky-table-header bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 text-[12px] font-semibold tracking-[0.05em] uppercase text-[#64748b]">Candidate</th>
              <th className="py-3 px-4 text-[12px] font-semibold tracking-[0.05em] uppercase text-[#64748b]">Target Company</th>
              <th className="py-3 px-4 text-[12px] font-semibold tracking-[0.05em] uppercase text-[#64748b]">Academic & LeetCode</th>
              <th className="py-3 px-4 text-[12px] font-semibold tracking-[0.05em] uppercase text-[#64748b]">Applied Date</th>
              <th className="py-3 px-4 text-[12px] font-semibold tracking-[0.05em] uppercase text-[#64748b]">Hiring Status</th>
              <th className="py-3 px-4 text-[12px] font-semibold tracking-[0.05em] uppercase text-[#64748b]">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9] bg-white">
            {filteredApps.map((app) => (
              <tr key={app.id} className="hover:bg-[#f8fafc] transition-colors">
                {/* Candidate */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-[#0f172a]">{app.studentName}</div>
                  <div className="text-slate-500 text-[11px] font-mono">{app.studentRoll} • {app.studentDepartment}</div>
                </td>

                {/* Target Company */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-[#0f172a]">{app.companyName}</div>
                  <div className="text-[#15803d] text-[11px] font-semibold">{app.packageLpa} LPA</div>
                </td>

                {/* Academic & LC */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-700 font-semibold">CGPA: {app.studentCgpa}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[#2563eb] font-semibold flex items-center space-x-0.5">
                      <Code2 className="w-3.5 h-3.5 text-[#15803d]" />
                      <span>{app.studentLeetcodeTotalSolved} Solved</span>
                    </span>
                  </div>
                </td>

                {/* Applied Date */}
                <td className="py-3.5 px-4 text-slate-500">
                  {app.appliedAt?.substring(0, 10) || '2026-08-27'}
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-4">
                  <StatusBadge status={app.status} />
                </td>

                {/* Update Action Dropdown */}
                <td className="py-3.5 px-4">
                  <select
                    value={app.status}
                    disabled={updatingId === app.id}
                    onChange={(e) => handleStatusChange(app.id, e.target.value, app.mentorRemarks)}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer"
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="TECHNICAL_ROUND">Technical Round</option>
                    <option value="HR_ROUND">HR Round</option>
                    <option value="SELECTED">Selected / Offer</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredApps.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            No applications found from your assigned mentees for the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
}
