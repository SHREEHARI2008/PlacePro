import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { companyAPI } from '../../services/api';
import EligibilityBadge from '../../components/EligibilityBadge';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  Building2,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

export default function UpcomingCompanies() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEligibleOnly, setFilterEligibleOnly] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [applyingId, setApplyingId] = useState(null);
  const [notification, setNotification] = useState('');

  const isDriveEligible = (drive) => Boolean(drive?.eligible ?? drive?.isEligible);

  // Detailed Ineligibility Reason Evaluator
  const getIneligibilityReasons = (drive) => {
    if (isDriveEligible(drive)) return [];

    // 1. Check reasons provided directly from backend EligibilityEngine
    if (Array.isArray(drive.eligibilityReasons) && drive.eligibilityReasons.length > 0) {
      return drive.eligibilityReasons;
    }

    const reasons = [];

    // 2. Explicit client-side metric comparison against user profile
    const studentCgpa = parseFloat(user?.cgpa || 0);
    const minCgpa = parseFloat(drive.minCgpa || 0);
    if (studentCgpa < minCgpa) {
      reasons.push(`Minimum CGPA required: ${minCgpa.toFixed(2)} (Your CGPA: ${studentCgpa.toFixed(2)})`);
    }

    const backlogs = parseInt(user?.activeBacklogs ?? user?.historyOfArrears ?? 0, 10);
    const maxBacklogs = parseInt(drive.maxBacklogsAllowed ?? 0, 10);
    if (backlogs > maxBacklogs) {
      reasons.push(`Active backlogs/arrears exceed allowed limit: ${backlogs} active (Allowed: ${maxBacklogs})`);
    }

    if (drive.eligibleBranches && drive.eligibleBranches.toUpperCase() !== 'ALL') {
      const branches = drive.eligibleBranches.split(',').map((b) => b.trim().toUpperCase());
      const dept = (user?.department || '').trim().toUpperCase();
      const isMatch = branches.some((b) =>
        b === 'ALL' || dept.includes(b) || b.includes(dept) ||
        (b === 'CSE' && (dept.includes('COMPUTER') || dept.includes('CS'))) ||
        (dept === 'CSE' && (b.includes('COMPUTER') || b.includes('CS')))
      );
      if (!isMatch && dept) {
        reasons.push(`Branch/Department not eligible: ${user?.department || 'Current Branch'} (Eligible: ${drive.eligibleBranches})`);
      }
    }

    const tenth = parseFloat(String(user?.tenthPercentage || '').replace('%', ''));
    if (!isNaN(tenth) && tenth > 0 && tenth < 60) {
      reasons.push(`10th percentage below required threshold: ${tenth}% (Required: ≥ 60%)`);
    }

    const twelfth = parseFloat(String(user?.twelfthPercentage || '').replace('%', ''));
    if (!isNaN(twelfth) && twelfth > 0 && twelfth < 60) {
      reasons.push(`12th percentage below required threshold: ${twelfth}% (Required: ≥ 60%)`);
    }

    return reasons.length > 0 ? reasons : ['Eligibility requirements not satisfied'];
  };

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const res = await companyAPI.getCompanies(user?.studentId || 0);
      if (res.data?.success) {
        setCompanies(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [user]);

  const handleApply = async (driveId) => {
    if (!user?.studentId) return;
    try {
      setApplyingId(driveId);
      const res = await companyAPI.applyCompany(user.studentId, driveId);
      if (res.data?.success) {
        setNotification('Application submitted successfully! Your mentor has been notified.');
        loadCompanies();
      }
    } catch (err) {
      setNotification(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setApplyingId(null);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.jobRole.toLowerCase().includes(search.toLowerCase()) ||
      c.requiredSkills.toLowerCase().includes(search.toLowerCase());

    const isEligible = isDriveEligible(c);
    const matchesEligible = !filterEligibleOnly || isEligible;
    const matchesBranch = selectedBranch === 'ALL' || c.eligibleBranches.includes(selectedBranch);

    return matchesSearch && matchesEligible && matchesBranch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div className="p-4 rounded-lg bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-[#15803d] shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification('')} className="text-[#15803d] font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-slate-100 text-[#0f172a]">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-[#0f172a]">Campus Placement Drives</h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time eligibility engine matches your CGPA, backlogs, department, and skills against visiting companies.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
          <span>Total Visiting: {companies.length}</span>
          <span className="text-slate-300">•</span>
          <span className="text-[#15803d]">
            Eligible: {companies.filter((c) => isDriveEligible(c)).length}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role, or tech stack..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[#cbd5e1] text-xs text-[#0f172a] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterEligibleOnly}
              onChange={(e) => setFilterEligibleOnly(e.target.checked)}
              className="rounded bg-white border-[#cbd5e1] text-[#2563eb] focus:ring-2 focus:ring-[#2563eb] w-4 h-4 cursor-pointer"
            />
            <span className="font-semibold">Eligible Only</span>
          </label>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-[#cbd5e1] text-xs text-[#0f172a] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          >
            <option value="ALL">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
          </select>
        </div>
      </div>

      {/* Companies Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCompanies.map((c) => {
          const isApplied = !!c.applicationStatus;
          const skills = c.requiredSkills.split(',').map((s) => s.trim());
          const isEligible = isDriveEligible(c);
          const ineligibilityReasons = getIneligibilityReasons(c);

          return (
            <div
              key={c.id}
              className={`bg-white rounded-xl p-6 border flex flex-col justify-between space-y-4 shadow-xs transition-all ${
                isEligible ? 'border-slate-200 hover:border-slate-300' : 'border-rose-200/80 bg-rose-50/10'
              }`}
            >
              {/* Card Top: Logo, Company, Role, CTC */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
                    <img
                      src={c.logoUrl || 'https://img.icons8.com/color/48/building.png'}
                      alt={c.companyName}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0f172a] tracking-tight">{c.companyName}</h3>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs text-slate-600 font-medium">{c.jobRole}</span>
                    </div>
                  </div>
                </div>

                {/* CTC Tag */}
                <div className="text-right shrink-0">
                  <div className="text-lg font-extrabold text-[#15803d] tracking-tight">{c.packageLpa} LPA</div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">CTC Package</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{c.description}</p>

              {/* Criteria Pills: Min CGPA, Max Backlogs, Location */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] py-2 border-y border-slate-100">
                <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase">Min CGPA</span>
                  <span className="font-bold text-[#0f172a]">{c.minCgpa.toFixed(2)}</span>
                </div>
                <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase">Max Backlogs</span>
                  <span className="font-bold text-[#0f172a]">{c.maxBacklogsAllowed}</span>
                </div>
                <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase">Location</span>
                  <span className="font-bold text-[#0f172a] truncate block">{c.jobLocation}</span>
                </div>
              </div>

              {/* Skills and Branches */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                  <span className="text-[11px] font-semibold text-slate-500">Required Skills:</span>
                  {skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold">Eligible Branches:</span>
                  <span>{c.eligibleBranches}</span>
                </div>
              </div>

              {/* Drive Date & Deadlines */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Drive: {c.driveDate}</span>
                </div>
                <div className="flex items-center space-x-1 text-[#b45309]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Deadline: {c.applicationDeadline}</span>
                </div>
              </div>

              {/* GForm Link as Hyperlink */}
              {c.registrationUrl && (
                <div className="text-[11px] bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 overflow-hidden">
                    <span className="font-bold text-emerald-900 shrink-0">G-Form:</span>
                    <a
                      href={c.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#059669] hover:underline font-mono truncate underline"
                      title={c.registrationUrl}
                    >
                      {c.registrationUrl}
                    </a>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                </div>
              )}

              {/* Detailed Ineligibility Reason Breakdown Alert Box */}
              {!isEligible && ineligibilityReasons.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/90 text-xs text-rose-900 space-y-1.5 shadow-xs">
                  <div className="flex items-center space-x-1.5 font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Ineligibility Reason Breakdown:</span>
                  </div>
                  <ul className="space-y-1 pl-5 list-disc text-[11.5px] text-rose-800 font-medium">
                    {ineligibilityReasons.map((reason, idx) => (
                      <li key={idx} className="leading-snug">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer: Eligibility Status Badge & Apply Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <EligibilityBadge
                  isEligible={isEligible}
                  reasons={isEligible ? [] : ineligibilityReasons}
                />

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  {c.registrationUrl && (
                    <a
                      href={c.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Register via GForm</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {isApplied ? (
                    <StatusBadge status={c.applicationStatus} />
                  ) : (
                    <button
                      onClick={() => handleApply(c.id)}
                      disabled={!isEligible || applyingId === c.id}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        isEligible
                          ? 'bg-[#0f172a] hover:bg-slate-800 text-white shadow-xs cursor-pointer'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      <span>{applyingId === c.id ? 'Applying...' : 'Apply on Portal'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 space-y-2">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No matching company drives found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search query or filters.</p>
        </div>
      )}
    </div>
  );
}
