import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { companyAPI } from '../../services/api';
import {
  PlusCircle,
  CheckCircle2,
  Eye,
  Edit3,
  Building2,
  Sparkles,
  RotateCcw,
  ExternalLink,
  Layers,
  Calendar,
  Globe
} from 'lucide-react';

const DEFAULT_FORM = {
  id: null,
  companyName: 'Atlassian',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Atlassian-Logo.svg',
  jobRole: 'Graduate Software Engineer',
  packageLpa: '36.00',
  minCgpa: '8.00',
  maxBacklogsAllowed: 0,
  eligibleBranches: 'CSE,IT,ECE',
  requiredSkills: 'Java,Distributed Systems,Data Structures,Microservices,SQL',
  jobLocation: 'Bengaluru (Hybrid)',
  driveDate: '2026-10-25',
  applicationDeadline: '2026-10-15',
  registrationUrl: 'https://forms.gle/abc-placement-registration',
  description: 'Atlassian is hiring high-potential campus graduates for our Jira & Confluence core cloud architecture teams. Assessment involves coding challenge followed by system architecture & values interview.',
};

export default function PostCompanyDrive({ setActiveTab }) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sharedDrives, setSharedDrives] = useState([]);
  const [loadingDrives, setLoadingDrives] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadSharedDrives = async (preselectId = null) => {
    try {
      setLoadingDrives(true);
      const res = await companyAPI.getCompanies();
      if (res.data?.success) {
        const drives = res.data.data || [];
        setSharedDrives(drives);

        const targetId = preselectId || searchParams.get('driveId');
        if (targetId) {
          const match = drives.find((d) => String(d.id) === String(targetId));
          if (match) {
            selectDriveForEditing(match);
          }
        }
      }
    } catch (err) {
      console.error('Error loading drives:', err);
    } finally {
      setLoadingDrives(false);
    }
  };

  useEffect(() => {
    loadSharedDrives();
  }, []);

  useEffect(() => {
    const driveParam = searchParams.get('driveId');
    if (driveParam && sharedDrives.length > 0) {
      const match = sharedDrives.find((d) => String(d.id) === String(driveParam));
      if (match) {
        selectDriveForEditing(match);
      }
    }
  }, [searchParams, sharedDrives]);

  const selectDriveForEditing = (drive) => {
    setIsEditing(true);
    setFormData({
      id: drive.id,
      companyName: drive.companyName || '',
      logoUrl: drive.logoUrl || '',
      jobRole: drive.jobRole || '',
      packageLpa: String(drive.packageLpa || '0'),
      minCgpa: String(drive.minCgpa || '0.00'),
      maxBacklogsAllowed: drive.maxBacklogsAllowed || 0,
      eligibleBranches: drive.eligibleBranches || '',
      requiredSkills: drive.requiredSkills || '',
      jobLocation: drive.jobLocation || '',
      driveDate: drive.driveDate || '',
      applicationDeadline: drive.applicationDeadline || '',
      registrationUrl: drive.registrationUrl || '',
      description: drive.description || '',
    });
    setSuccess('');
    setError('');
  };

  const handleResetToNew = () => {
    setIsEditing(false);
    setFormData(DEFAULT_FORM);
    setSearchParams({});
    setSuccess('');
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      setSubmitting(true);
      const payload = {
        companyName: formData.companyName.trim(),
        logoUrl: formData.logoUrl.trim(),
        jobRole: formData.jobRole.trim(),
        packageLpa: parseFloat(formData.packageLpa),
        minCgpa: parseFloat(formData.minCgpa),
        maxBacklogsAllowed: parseInt(formData.maxBacklogsAllowed),
        eligibleBranches: formData.eligibleBranches.trim(),
        requiredSkills: formData.requiredSkills.trim(),
        jobLocation: formData.jobLocation.trim(),
        driveDate: formData.driveDate,
        applicationDeadline: formData.applicationDeadline,
        registrationUrl: formData.registrationUrl.trim(),
        description: formData.description.trim(),
        postedByMentorId: user?.mentorId,
        status: 'UPCOMING',
      };

      if (isEditing && formData.id) {
        payload.id = formData.id;
        const res = await companyAPI.updateCompany(payload);
        if (res.data?.success) {
          setSuccess(`Placement drive for ${formData.companyName} updated successfully! A 'Placement Drive Updation' alert has been sent to all students.`);
          loadSharedDrives(formData.id);
        }
      } else {
        const res = await companyAPI.postCompany(payload);
        if (res.data?.success) {
          const newDriveId = res.data.data?.id;
          setSuccess(`New placement drive for ${formData.companyName} published successfully! Visible to all mentors and students across the institution.`);
          loadSharedDrives(newDriveId);
          setTimeout(() => {
            if (setActiveTab) setActiveTab('dashboard');
          }, 2500);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || (isEditing ? 'Failed to update placement drive' : 'Failed to post placement drive'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-slate-100 text-[#0f172a]">
              {isEditing ? <Edit3 className="w-5 h-5 text-blue-600" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <h1 className="text-xl font-bold text-[#0f172a]">
              {isEditing ? `Edit Shared Drive: ${formData.companyName}` : 'Post New Placement Drive'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
              <Globe className="w-3 h-3" />
              <span>Globally Shared Drive</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isEditing
              ? 'Every faculty mentor can manage and edit shared placement drives. Changes trigger instant student notifications.'
              : 'Publish visiting company recruitment details, criteria thresholds, and Google Form links for all eligible students.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isEditing && (
            <button
              type="button"
              onClick={handleResetToNew}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Switch to Create New</span>
            </button>
          )}

          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Shared Drives: <strong className="text-[#0f172a]">{sharedDrives.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Shared Drive Selector Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <Layers className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-700">Quick Drive Switcher:</span>
          <span className="text-slate-400">Select any shared drive to inspect or edit details</span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={isEditing ? formData.id || '' : ''}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                handleResetToNew();
              } else {
                const match = sharedDrives.find((d) => String(d.id) === String(val));
                if (match) selectDriveForEditing(match);
              }
            }}
            className="w-full sm:w-72 px-3 py-1.5 rounded-lg bg-white border border-[#cbd5e1] text-xs text-[#0f172a] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          >
            <option value="">+ Post Brand New Drive</option>
            {sharedDrives.map((d) => (
              <option key={d.id} value={d.id}>
                Edit: {d.companyName} ({d.packageLpa} LPA - {d.jobRole})
              </option>
            ))}
          </select>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-lg bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-[#15803d] shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-[#fee2e2] border border-[#fecaca] text-[#991b1b] text-xs flex items-center space-x-2">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-[#0f172a]">
              {isEditing ? `Editing Drive #${formData.id}` : 'Create New Recruitment Drive'}
            </h3>
            {isEditing && (
              <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Shared Global Permission
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Google, Atlassian, Oracle"
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Company Logo URL</label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Job Role / Designation *</label>
                <input
                  type="text"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Software Development Engineer - I"
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Package CTC (in LPA) *</label>
                <input
                  type="number"
                  step="0.1"
                  name="packageLpa"
                  value={formData.packageLpa}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 24.5"
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Minimum CGPA *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="minCgpa"
                  value={formData.minCgpa}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Max Active Backlogs *</label>
                <input
                  type="number"
                  min="0"
                  name="maxBacklogsAllowed"
                  value={formData.maxBacklogsAllowed}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Job Location *</label>
                <input
                  type="text"
                  name="jobLocation"
                  value={formData.jobLocation}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Bangalore / Remote"
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Eligible Branches (comma separated) *</label>
                <input
                  type="text"
                  name="eligibleBranches"
                  value={formData.eligibleBranches}
                  onChange={handleChange}
                  required
                  placeholder="CSE,IT,ECE,EEE"
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Required Skills (comma separated) *</label>
                <input
                  type="text"
                  name="requiredSkills"
                  value={formData.requiredSkills}
                  onChange={handleChange}
                  required
                  placeholder="Java,Python,DSA,SQL,System Design"
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Drive Date *</label>
                <input
                  type="date"
                  name="driveDate"
                  value={formData.driveDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Application Deadline *</label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Registration Form Link * <span className="text-[10px] text-slate-400 font-normal">(Google Form, portal URL, or company registration link)</span>
              </label>
              <input
                type="url"
                name="registrationUrl"
                value={formData.registrationUrl}
                onChange={handleChange}
                required
                placeholder="https://forms.gle/... or https://company.com/apply"
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Job Description & Hiring Process</label>
              <textarea
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Overview of hiring rounds, role responsibilities..."
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            <div className="pt-3 flex items-center space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 text-white font-bold transition-all shadow-xs flex items-center justify-center space-x-2 text-sm cursor-pointer"
              >
                {isEditing ? <Edit3 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                <span>
                  {submitting
                    ? isEditing
                      ? 'Saving Updates...'
                      : 'Publishing Drive...'
                    : isEditing
                    ? 'Save & Update Shared Drive'
                    : 'Publish Placement Drive'}
                </span>
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleResetToNew}
                  className="py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 space-y-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 text-[#0f172a] font-bold text-xs">
              <Eye className="w-4 h-4 text-[#2563eb]" />
              <span>Live Student Card Preview</span>
            </div>

            <div className="mt-4 p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
                    <img
                      src={formData.logoUrl || 'https://img.icons8.com/color/48/building.png'}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0f172a]">{formData.companyName || 'Company'}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{formData.jobRole || 'Role'}</p>
                  </div>
                </div>
                <span className="text-[#15803d] font-bold text-sm">{formData.packageLpa || '0'} LPA</span>
              </div>

              <p className="text-[11px] text-slate-600 line-clamp-2">{formData.description || 'Description...'}</p>

              <div className="grid grid-cols-2 gap-2 text-[10px] py-1.5 border-y border-slate-200">
                <div>Min CGPA: <strong className="text-[#0f172a]">{formData.minCgpa}</strong></div>
                <div>Backlogs: <strong className="text-[#0f172a]">{formData.maxBacklogsAllowed}</strong></div>
              </div>

              <div className="text-[10px] text-slate-500">
                <span>Eligible: {formData.eligibleBranches}</span>
              </div>

              {formData.registrationUrl && (
                <div className="pt-1">
                  <div className="w-full py-1.5 rounded-md bg-[#059669] text-white text-[10px] font-bold text-center">
                    Register / Apply via GForm
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500">
                <span>Drive: {formData.driveDate}</span>
                <span className="text-[#15803d] font-bold">● Active</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            {isEditing
              ? 'Saving updates on this shared drive automatically syncs across all mentor and student portals, and broadcasts an alert to all students.'
              : 'Once published, the system automatically verifies student eligibility and activates both the in-portal apply button and direct Google Form registration CTA.'}
          </div>
        </div>
      </div>
    </div>
  );
}
