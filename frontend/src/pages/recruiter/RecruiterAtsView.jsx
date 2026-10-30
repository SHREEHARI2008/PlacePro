import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { companyAPI } from '../../services/api';
import DriveManagementCard from '../../components/ui/DriveManagementCard';
import CandidatePipelineTracker from '../../components/ui/CandidatePipelineTracker';
import { Building2, CheckCircle2 } from 'lucide-react';

export default function RecruiterAtsView() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [compsRes, appsRes] = await Promise.all([
        companyAPI.getCompanies(),
        companyAPI.getApplications(),
      ]);

      if (compsRes.data?.success) setCompanies(compsRes.data.data);
      if (appsRes.data?.success) setApplications(appsRes.data.data);
    } catch (err) {
      console.error('Error loading Recruiter ATS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUpdateStatus = async (appId, newStatus, remarks) => {
    try {
      setUpdatingId(appId);
      const res = await companyAPI.updateApplicationStatus(appId, newStatus, remarks || 'Updated by Recruiter ATS');
      if (res.data?.success) {
        setNotification(`Candidate stage updated to ${newStatus}`);
        loadData();
      }
    } catch (err) {
      setNotification('Failed to update stage');
    } finally {
      setUpdatingId(null);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const filteredApps = selectedDrive
    ? applications.filter((a) => String(a.driveId) === String(selectedDrive.id))
    : applications;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#0f172a] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading Recruiter ATS Workstation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-lg bg-[#f3e8ff] border border-[#e9d5ff] text-[#6b21a8] text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#6b21a8] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-slate-100 text-[#0f172a]">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-[#0f172a]">Recruiter ATS & Drive Manager</h1>
          </div>
          <p className="text-xs text-slate-500">
            Manage company drives, review applicant skill profiles, and advance candidates through interview rounds.
          </p>
        </div>

        {selectedDrive && (
          <button
            onClick={() => setSelectedDrive(null)}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-[#0f172a] text-xs font-semibold border border-slate-200 shadow-xs"
          >
            Show All Company Drives
          </button>
        )}
      </div>

      {/* Drive Management Card View */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Visiting Company Drives ({companies.length})
          </h2>
          {selectedDrive && (
            <span className="text-xs text-[#2563eb] font-semibold">
              Filter Active: {selectedDrive.companyName}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((c) => (
            <DriveManagementCard
              key={c.id}
              drive={c}
              onSelectDrive={(drive) => setSelectedDrive(drive)}
            />
          ))}
        </div>
      </div>

      {/* Candidate Pipeline / Round Tracker with Quick Buttons */}
      <div>
        <CandidatePipelineTracker
          applications={filteredApps}
          onUpdateStatus={handleUpdateStatus}
          updatingId={updatingId}
        />
      </div>
    </div>
  );
}
