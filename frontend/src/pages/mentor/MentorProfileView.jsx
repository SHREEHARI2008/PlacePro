import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mentorAPI } from '../../services/api';
import {
  Shield,
  Building,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Users,
  Award,
  CheckCircle2,
  Edit2,
  X,
  FileCheck2,
  Calendar
} from 'lucide-react';

export default function MentorProfileView() {
  const { user, updateCurrentUser } = useAuth();
  const [mentorData, setMentorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [cabinLocation, setCabinLocation] = useState('');

  const loadProfile = async () => {
    const mentorId = user?.mentorId;
    const userId = user?.userId;
    if (!mentorId && !userId) return;
    try {
      setLoading(true);
      const res = await mentorAPI.getProfile({ mentorId, userId });
      if (res.data?.success) {
        const m = res.data.data;
        setMentorData(m);
        setName(m.name || user?.name || '');
        setPhone(m.phoneNumber || user?.phoneNumber || '');
        setDepartment(m.department || user?.department || 'Engineering');
        setDesignation(m.designation || 'Faculty Mentor & Placement Coordinator');
        setCabinLocation(m.cabinLocation || 'Academic Block, Faculty Wing');
      }
    } catch (err) {
      console.error('Failed to load mentor profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const mentorId = mentorData?.mentorId || mentorData?.id || user?.mentorId;
      const payload = {
        mentorId,
        name,
        phoneNumber: phone,
        department,
        designation,
        cabinLocation,
      };

      const res = await mentorAPI.updateProfile(payload);
      if (res.data?.success) {
        setToastMessage('Faculty Mentor profile updated successfully!');
        setShowEditModal(false);
        updateCurrentUser({ name, phoneNumber: phone, department, designation, cabinLocation });
        loadProfile();
      }
    } catch (err) {
      setToastMessage(err.response?.data?.error || 'Failed to update mentor profile');
    } finally {
      setSaving(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading faculty dossier...</p>
        </div>
      </div>
    );
  }

  const m = mentorData || {};
  const staffId = m.mentorStaffId || user?.mentorStaffId || 'MTR-2026';
  const menteeCount = m.menteesCount !== undefined ? m.menteesCount : (m.menteeCount !== undefined ? m.menteeCount : 0);
  const placedCount = m.placedCount !== undefined ? m.placedCount : 0;
  const placementRate = m.placementRate !== undefined ? m.placementRate : (menteeCount > 0 ? (placedCount / menteeCount * 100) : 0);
  const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-xs font-bold text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navy Header Strip */}
        <div className="h-28 bg-[#0b1940] relative px-6 sm:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white/80 text-xs font-medium">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Faculty Placement &amp; Mentorship Cell</span>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
            Active Placement Coordinator
          </span>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 gap-4 pb-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
              <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-md bg-white">
                <img
                  src={m.avatarUrl || user?.avatarUrl || FALLBACK_AVATAR}
                  alt={m.name || 'Mentor Avatar'}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2 justify-center sm:justify-start">
                  <h1 className="text-xl font-bold text-slate-900">{m.name || user?.name || 'Faculty Mentor'}</h1>
                  <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {staffId}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500">
                  {m.designation || 'Faculty Mentor & Placement Coordinator'}
                </p>
                <p className="text-xs text-slate-600 font-semibold">
                  {m.department || 'Computer Science & Engineering'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>

          {/* Quick Metrics Grid (Active Drives removed per requirements) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-500 text-[11px] font-semibold mb-1">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Assigned Mentees</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{menteeCount} Students</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-500 text-[11px] font-semibold mb-1">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Placed Students</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{placedCount} / {menteeCount}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-500 text-[11px] font-semibold mb-1">
                <FileCheck2 className="w-4 h-4 text-purple-600" />
                <span>Placement Rate</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {placementRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Office Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Contact &amp; Cabin Information
          </h2>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-3 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Institutional Email</span>
              </div>
              <span className="font-semibold text-slate-900 font-mono">{m.email || user?.email}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-3 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Official Mobile</span>
              </div>
              <span className="font-semibold text-slate-900 font-mono">{m.phoneNumber || user?.phoneNumber || '+91 9840123456'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-3 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Office / Cabin</span>
              </div>
              <span className="font-semibold text-slate-900">{m.cabinLocation || 'Academic Block A, Room 304'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-3 text-slate-600">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Campus</span>
              </div>
              <span className="font-semibold text-slate-900">ABC College</span>
            </div>
          </div>
        </div>

        {/* Mentorship Responsibilities */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Placement Cell Responsibilities
          </h2>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Candidate Academic Verification</span>
                <span className="text-[11px] text-slate-500">Audit mentee semester GPAs, active backlog count, and tier eligibility.</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Recruitment Drive Authoring</span>
                <span className="text-[11px] text-slate-500">Publish visiting company drives, job descriptions, CTC packages, and criteria.</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">LeetCode Problem Analytics</span>
                <span className="text-[11px] text-slate-500">Supervise live algorithmic problem solving milestones across student batches.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Edit Faculty Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cabin Location</label>
                <input
                  type="text"
                  value={cabinLocation}
                  onChange={(e) => setCabinLocation(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#0f172a] text-white font-bold hover:bg-[#1e293b]"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
