import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI, leetcodeAPI, mentorAPI, studentAPI } from '../../services/api';
import campusSunset from '../../assets/campus-sunset.svg';
import {
  Camera,
  Building,
  GraduationCap,
  BookOpen,
  Edit2,
  CheckCircle2,
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Code2,
  Award,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Trophy,
  Check,
  Lock,
  ExternalLink,
  FileText,
  UserCheck
} from 'lucide-react';

export default function StudentProfileView() {
  const { user, updateCurrentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('academic'); // 'academic', 'leetcode', 'resume'
  const [toastMessage, setToastMessage] = useState('');
  const [syncingLc, setSyncingLc] = useState(false);

  // Mentor Selection State
  const [mentorsList, setMentorsList] = useState([]);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [savingMentor, setSavingMentor] = useState(false);

  // Resume State
  const [resumeDriveUrl, setResumeDriveUrl] = useState('');
  const [resumeInput, setResumeInput] = useState('');
  const [savingResume, setSavingResume] = useState(false);
  const [resumeError, setResumeError] = useState('');

  // Modals
  const [showPersonalEditModal, setShowPersonalEditModal] = useState(false);
  const [showAcademicEditModal, setShowAcademicEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Personal Info Form State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGender, setEditGender] = useState('Not Specified');
  const [editDob, setEditDob] = useState('');
  const [editLeetcode, setEditLeetcode] = useState('');

  // Academic Info Form State (no hardcoded defaults)
  const [editTenth, setEditTenth] = useState('');
  const [editTwelfth, setEditTwelfth] = useState('');
  const [editDiploma, setEditDiploma] = useState('');
  const [editUndergrad, setEditUndergrad] = useState('');

  // Avatar Management State
  const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarInput, setAvatarInput] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  ];

  const loadProfile = async () => {
    try {
      setLoading(true);
      const studentId = user?.studentId;
      const res = await userAPI.getProfile({ studentId, userId: user?.userId });
      if (res.data?.success) {
        const d = res.data.data;
        setProfileData(d);
        const s = d.student || {};
        setEditName(s.name || user?.name || '');
        setEditPhone(s.phoneNumber || user?.phoneNumber || '');
        setEditGender(s.gender || 'Not Specified');
        setEditDob(s.dateOfBirth || '');
        setEditLeetcode(s.leetcodeUsername || user?.leetcodeUsername || '');
        setSelectedMentorId(s.mentorId || '');

        setResumeDriveUrl(s.resumeDriveUrl || '');
        setResumeInput(s.resumeDriveUrl || '');
        setAvatarInput(s.avatarUrl || user?.avatarUrl || '');

        setEditTenth(s.tenthPercentage ? String(s.tenthPercentage).replace('%', '') : '0');
        setEditTwelfth(s.twelfthPercentage ? String(s.twelfthPercentage).replace('%', '') : '0');
        setEditDiploma(s.diplomaPercentage ? String(s.diplomaPercentage).replace('%', '') : '0');
        setEditUndergrad(s.cgpa ? Number(s.cgpa).toFixed(2) : (s.undergraduateGpa || '0.00'));
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMentors = async () => {
    try {
      const res = await mentorAPI.getMentors();
      if (res.data?.success) {
        setMentorsList(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load mentors:', err);
    }
  };

  useEffect(() => {
    loadProfile();
    loadMentors();
  }, [user]);

  const handleSyncLeetCode = async () => {
    const studentId = profileData?.student?.studentId || user?.studentId;
    const handle = profileData?.student?.leetcodeUsername || user?.leetcodeUsername || editLeetcode;
    if (!studentId || !handle) return;

    try {
      setSyncingLc(true);
      const res = await leetcodeAPI.syncProfile(studentId, handle);
      if (res.data?.success) {
        setToastMessage(`LeetCode stats synced directly from GraphQL for @${handle}!`);
        loadProfile();
      }
    } catch (err) {
      setToastMessage(err.response?.data?.error || 'Failed to sync LeetCode statistics');
    } finally {
      setSyncingLc(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const studentId = profileData?.student?.studentId || user?.studentId;
      // Requirement 4: LeetCode field is locked from student edits
      const payload = {
        studentId,
        name: editName,
        phoneNumber: editPhone,
        gender: editGender,
        dateOfBirth: editDob,
      };

      const res = await userAPI.updateProfile(payload);
      if (res.data?.success) {
        setToastMessage('Personal information updated successfully!');
        setShowPersonalEditModal(false);
        updateCurrentUser({ name: editName, phoneNumber: editPhone });
        loadProfile();
      }
    } catch (err) {
      setToastMessage(err.response?.data?.error || 'Failed to update personal information');
    } finally {
      setSaving(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const handleSaveAcademic = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const studentId = profileData?.student?.studentId || user?.studentId;
      const payload = {
        studentId,
        tenthPercentage: editTenth ? String(editTenth).replace('%', '').trim() : '0',
        twelfthPercentage: editTwelfth ? String(editTwelfth).replace('%', '').trim() : '0',
        diplomaPercentage: editDiploma ? String(editDiploma).replace('%', '').trim() : '0',
        undergraduateGpa: editUndergrad || '0.00',
      };

      const res = await userAPI.updateProfile(payload);
      if (res.data?.success) {
        setToastMessage('Academic performance updated successfully!');
        setShowAcademicEditModal(false);
        loadProfile();
      }
    } catch (err) {
      setToastMessage(err.response?.data?.error || 'Failed to update academic information');
    } finally {
      setSaving(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const handleSaveAvatar = async (e) => {
    if (e) e.preventDefault();
    if (!avatarInput.trim()) return;
    try {
      setSavingAvatar(true);
      const studentId = profileData?.student?.studentId || user?.studentId;
      const res = await userAPI.updateProfile({
        studentId,
        avatarUrl: avatarInput.trim()
      });
      if (res.data?.success) {
        setToastMessage('Profile photo updated successfully!');
        if (updateCurrentUser) updateCurrentUser({ avatarUrl: avatarInput.trim() });
        setShowAvatarModal(false);
        loadProfile();
      }
    } catch (err) {
      setToastMessage(err.response?.data?.error || 'Failed to update profile photo');
    } finally {
      setSavingAvatar(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  // Requirement 4: Mentor Selection Handler
  const handleUpdateMentor = async () => {
    if (!selectedMentorId) {
      setToastMessage('Please select a mentor from the list.');
      return;
    }
    const studentId = profileData?.student?.studentId || user?.studentId;
    try {
      setSavingMentor(true);
      const res = await studentAPI.updateMentor(studentId, selectedMentorId);
      if (res.data?.success) {
        setToastMessage('Assigned mentor updated successfully!');
        setShowMentorModal(false);
        loadProfile();
      }
    } catch (err) {
      setToastMessage(err.response?.data?.error || 'Failed to update mentor.');
    } finally {
      setSavingMentor(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  // Requirement 4: Resume Drive Link Handler with URL validation
  const handleSaveResume = async (e) => {
    e.preventDefault();
    setResumeError('');
    if (!resumeInput.trim()) {
      setResumeError('Please provide a Google Drive or resume link URL.');
      return;
    }
    if (!/^https?:\/\/.+/i.test(resumeInput.trim())) {
      setResumeError('URL must begin with https:// or http://');
      return;
    }
    const studentId = profileData?.student?.studentId || user?.studentId;
    try {
      setSavingResume(true);
      const res = await studentAPI.updateResume(studentId, resumeInput.trim());
      if (res.data?.success) {
        setResumeDriveUrl(resumeInput.trim());
        setToastMessage('Google Drive resume link saved successfully!');
        loadProfile();
      }
    } catch (err) {
      setResumeError(err.response?.data?.error || 'Failed to save resume URL.');
    } finally {
      setSavingResume(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#1a5cff] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading student profile...</p>
        </div>
      </div>
    );
  }

  const s = profileData?.student || {};
  const lc = profileData?.leetcodeStats || {};
  const mentor = profileData?.mentor || {};
  const mentorName = mentor.name || s.mentorName || 'Not Assigned';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-150">
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

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Landscape Sunset Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#0b1940]">
          <img
            src={campusSunset}
            alt="Campus Sunset Banner"
            className="w-full h-full object-cover opacity-90"
          />
        </div>

        {/* Avatar and Quick Stats Header */}
        <div className="px-6 sm:px-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 sm:-mt-20 gap-6">
            {/* Avatar container with photo upload button */}
            <div className="flex flex-col items-center sm:items-start space-y-2">
              <div className="relative group w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-md bg-white">
                <img
                  src={s.avatarUrl || user?.avatarUrl || FALLBACK_AVATAR}
                  alt={s.name || user?.name || 'Student Avatar'}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-[10px] font-bold cursor-pointer"
                  title="Upload or change profile picture"
                >
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span>Update Photo</span>
                </button>
              </div>

              {/* Name & Status */}
              <div className="text-center sm:text-left pt-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                  {s.name || user?.name || 'Student Candidate'}
                </h1>
                <div className="flex items-center space-x-2 pt-0.5 justify-center sm:justify-start">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Placement Active
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-xs font-semibold text-slate-500">
                    {s.registerNumber || s.rollNumber || user?.registerNumber || 'REG-PENDING'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick-Info Cards */}
            <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-end pb-2">
              {/* College Branding: ABC College */}
              <div className="flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#1a5cff] shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-slate-500 font-medium">Institution</div>
                  <div className="font-bold text-xs text-slate-900">ABC College</div>
                </div>
              </div>

              {/* Batch */}
              <div className="flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#1a5cff] shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-slate-500 font-medium">Batch</div>
                  <div className="font-bold text-xs text-slate-900">{s.batchYear || 2026}</div>
                </div>
              </div>

              {/* Department */}
              <div className="flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#1a5cff] shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-slate-500 font-medium">Department</div>
                  <div className="font-bold text-xs text-slate-900">{s.department || 'CSE'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pill Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('academic')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'academic'
              ? 'bg-[#0b1940] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Profile &amp; Academics
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leetcode')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'leetcode'
              ? 'bg-[#0b1940] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-amber-500" />
          <span>Live LeetCode Tracker</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resume')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'resume'
              ? 'bg-[#0b1940] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-500" />
          <span>Resume &amp; Drive Link</span>
        </button>
      </div>

      {/* TAB 1: Profile & Academics */}
      {activeTab === 'academic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Personal Information & Mentor Selection */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>
                <button
                  type="button"
                  onClick={() => setShowPersonalEditModal(true)}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-[#1a5cff] hover:underline"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-baseline py-1">
                  <span className="text-slate-500 font-medium">Full Name</span>
                  <span className="font-bold text-slate-900 uppercase">{s.name || user?.name}</span>
                </div>

                <div className="flex justify-between items-baseline py-1">
                  <span className="text-slate-500 font-medium">Register Number</span>
                  <span className="font-mono font-bold text-slate-900">{s.registerNumber || s.rollNumber}</span>
                </div>

                <div className="flex justify-between items-baseline py-1">
                  <span className="text-slate-500 font-medium">Institutional Email</span>
                  <span className="font-mono text-slate-800 truncate max-w-[200px]" title={s.email || user?.email}>
                    {s.email || user?.email}
                  </span>
                </div>

                <div className="flex justify-between items-baseline py-1">
                  <span className="text-slate-500 font-medium">Mobile Number</span>
                  <span className="font-mono text-slate-800">{s.phoneNumber || user?.phoneNumber}</span>
                </div>

                <div className="flex justify-between items-baseline py-1">
                  <span className="text-slate-500 font-medium">Gender</span>
                  <span className="font-medium text-slate-800">{s.gender || 'Female'}</span>
                </div>

                <div className="flex justify-between items-baseline py-1">
                  <span className="text-slate-500 font-medium">Date of Birth</span>
                  <span className="font-medium text-slate-800">{s.dateOfBirth || '30-12-2004'}</span>
                </div>

                {/* Requirement 4: LeetCode Field Strictly Locked */}
                <div className="flex justify-between items-center py-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center space-x-1">
                    <Code2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>LeetCode Handle</span>
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold font-mono text-[#1a5cff]">
                      @{s.leetcodeUsername || user?.leetcodeUsername || 'not_connected'}
                    </span>
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Locked</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirement 4: Mentor Selection System Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-[#1a5cff]" />
                  <h3 className="text-sm font-bold text-slate-900">Assigned Faculty Mentor</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMentorModal(true)}
                  className="text-xs font-semibold text-[#1a5cff] hover:underline"
                >
                  Change Mentor
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{mentorName}</div>
                    <div className="text-xs text-slate-500">
                      {mentor.department ? `Department of ${mentor.department}` : 'Department Placement Faculty'}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-[#1a5cff] border border-blue-200">
                    Active Mentor
                  </span>
                </div>
                {mentor.email && (
                  <div className="text-xs text-slate-600 font-mono pt-1 border-t border-slate-200/60">
                    {mentor.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Academic Information Table */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Academic Standing &amp; Scores</h2>
              <button
                type="button"
                onClick={() => setShowAcademicEditModal(true)}
                className="flex items-center space-x-1.5 text-xs font-semibold text-[#1a5cff] hover:underline"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Scores</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-5 font-bold text-slate-800">Qualification Level</th>
                    <th className="py-3 px-5 font-bold text-slate-800 text-right sm:text-left">Score / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-slate-600">Secondary School (10th)</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 text-right sm:text-left">
                      {s.tenthPercentage ? (s.tenthPercentage.includes('%') ? s.tenthPercentage : `${s.tenthPercentage}%`) : '0%'}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-slate-600">Higher Secondary (12th)</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 text-right sm:text-left">
                      {s.twelfthPercentage ? (s.twelfthPercentage.includes('%') ? s.twelfthPercentage : `${s.twelfthPercentage}%`) : '0%'}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-slate-600">Diploma</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 text-right sm:text-left">
                      {s.diplomaPercentage && s.diplomaPercentage !== 'Not Applicable' ? (s.diplomaPercentage.includes('%') ? s.diplomaPercentage : `${s.diplomaPercentage}%`) : '0%'}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-slate-600">Undergraduate Degree &amp; CGPA</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 text-right sm:text-left">
                      {s.cgpa ? `${Number(s.cgpa).toFixed(2)} CGPA` : `${Number(s.undergraduateGpa || 0).toFixed(2)} CGPA`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Placement Eligibility Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recruitment Standing</span>
                <div className="font-bold text-slate-900">Eligible for Visiting Tier-1 Product &amp; Service Drives</div>
              </div>
              <span className="px-3 py-1 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                {s.historyOfArrears === 0 || !s.historyOfArrears ? 'Zero Backlogs' : `${s.historyOfArrears} Backlog(s)`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Live LeetCode Widget */}
      {activeTab === 'leetcode' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">
                  LeetCode Live Synchronization
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  @{lc.username || s.leetcodeUsername || user?.leetcodeUsername || 'handle'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Direct GraphQL integration queries LeetCode's official endpoint in real time. (Handle is locked and verified upon signup)
              </p>
            </div>

            <button
              type="button"
              onClick={handleSyncLeetCode}
              disabled={syncingLc}
              className="px-4 py-2 rounded-xl bg-[#0b1940] hover:bg-[#1a5cff] text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-xs disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingLc ? 'animate-spin' : ''}`} />
              <span>{syncingLc ? 'Querying LeetCode...' : 'Sync Live Stats'}</span>
            </button>
          </div>

          {/* Real LeetCode Problem Counter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Solved</span>
              <div className="text-2xl font-bold text-slate-900">
                {lc.totalSolved !== undefined ? lc.totalSolved : 0}
              </div>
              <span className="text-[10px] text-slate-400">Total Solved Problems</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
              <span className="text-[11px] font-semibold text-emerald-700 block mb-1">Easy Problems</span>
              <div className="text-2xl font-bold text-emerald-700">
                {lc.easySolved !== undefined ? lc.easySolved : 0}
              </div>
              <span className="text-[10px] text-emerald-600">Fundamental DSA</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80">
              <span className="text-[11px] font-semibold text-amber-700 block mb-1">Medium Problems</span>
              <div className="text-2xl font-bold text-amber-700">
                {lc.mediumSolved !== undefined ? lc.mediumSolved : 0}
              </div>
              <span className="text-[10px] text-amber-600">Interview Core</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80">
              <span className="text-[11px] font-semibold text-rose-700 block mb-1">Hard Problems</span>
              <div className="text-2xl font-bold text-rose-700">
                {lc.hardSolved !== undefined ? lc.hardSolved : 0}
              </div>
              <span className="text-[10px] text-rose-600">Competitive Tier</span>
            </div>
          </div>

          {/* Streak & Active Days */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Maximum Streak</div>
                <div className="text-lg font-bold text-slate-900">{lc.maxStreak || lc.streakDays || 0} Days</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#1a5cff] shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Total Active Days</div>
                <div className="text-lg font-bold text-slate-900">{lc.totalActiveDays || 0} Days</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Global Ranking</div>
                <div className="text-lg font-bold text-slate-900">
                  {lc.globalRanking ? `#${lc.globalRanking.toLocaleString()}` : 'Active'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Requirement 4: Resume Drive Link */}
      {activeTab === 'resume' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Placement Resume Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Provide your public Google Drive resume link for visiting corporate recruiters and faculty mentors.
            </p>
          </div>

          <form onSubmit={handleSaveResume} className="max-w-xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Google Drive Resume Link <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                value={resumeInput}
                onChange={(e) => {
                  setResumeInput(e.target.value);
                  setResumeError('');
                }}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Ensure access permission on Google Drive is set to <strong>"Anyone with the link can view"</strong>.
              </p>
              {resumeError && (
                <p className="text-xs font-semibold text-rose-600 mt-1">{resumeError}</p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={savingResume}
                className="px-5 py-2.5 rounded-xl bg-[#0b1940] hover:bg-[#1a5cff] text-white text-xs font-bold transition-all shadow-xs"
              >
                {savingResume ? 'Saving Link...' : 'Save Resume Link'}
              </button>

              {resumeDriveUrl && (
                <a
                  href={resumeDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#1a5cff]" />
                  <span>View Resume</span>
                </a>
              )}
            </div>
          </form>

          {/* Current Status Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Current Registered Resume
            </span>
            {resumeDriveUrl ? (
              <div className="flex items-center justify-between text-xs">
                <a
                  href={resumeDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[#1a5cff] truncate max-w-md hover:underline"
                >
                  {resumeDriveUrl}
                </a>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  Verified URL
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No resume link provided yet. Add your Google Drive link above so mentors and recruiters can access your profile.
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Edit Personal Information (Requirement 4: LeetCode Locked) */}
      {showPersonalEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Edit Personal Information</h3>
              <button onClick={() => setShowPersonalEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePersonal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40"
                  />
                </div>
              </div>

              {/* Requirement 4: LeetCode locked / read-only in edit modal */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">LeetCode Username</label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center space-x-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Locked (Registered Handle)</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={editLeetcode}
                  disabled
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-mono cursor-not-allowed select-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  LeetCode handles are locked upon registration to maintain placement verification integrity.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPersonalEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#0b1940] text-white font-bold hover:bg-[#1a5cff]"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Academic Information */}
      {showAcademicEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Edit Academic Information</h3>
              <button onClick={() => setShowAcademicEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAcademic} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">10th Percentage</label>
                <input
                  type="text"
                  value={editTenth}
                  onChange={(e) => setEditTenth(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">12th Percentage</label>
                <input
                  type="text"
                  value={editTwelfth}
                  onChange={(e) => setEditTwelfth(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Diploma</label>
                <input
                  type="text"
                  value={editDiploma}
                  onChange={(e) => setEditDiploma(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cumulative CGPA</label>
                <input
                  type="text"
                  value={s.cgpa ? `${Number(s.cgpa).toFixed(2)} CGPA (Official)` : '0.00 CGPA'}
                  disabled
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  CGPA is calculated from semester transcript records logged in the Academic section.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAcademicEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#0b1940] text-white font-bold hover:bg-[#1a5cff]"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Requirement 4: Mentor Selection Modal */}
      {showMentorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-[#1a5cff]" />
                <h3 className="font-bold text-sm text-slate-900">Select Faculty Mentor</h3>
              </div>
              <button onClick={() => setShowMentorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Choose your assigned department mentor from the list of registered faculty members.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {mentorsList.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  No mentors found in database.
                </div>
              ) : (
                mentorsList.map((m) => (
                  <div
                    key={m.mentorId}
                    onClick={() => setSelectedMentorId(m.mentorId)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      selectedMentorId === m.mentorId
                        ? 'border-[#1a5cff] bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {m.department ? `Dept: ${m.department}` : 'Department Placement'} | {m.designation || 'Faculty'}
                      </div>
                    </div>
                    {selectedMentorId === m.mentorId && (
                      <CheckCircle2 className="w-4 h-4 text-[#1a5cff]" />
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowMentorModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateMentor}
                disabled={savingMentor || !selectedMentorId}
                className="px-5 py-2 rounded-xl bg-[#0b1940] text-white text-xs font-bold hover:bg-[#1a5cff] disabled:opacity-50"
              >
                {savingMentor ? 'Assigning...' : 'Confirm Mentor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Update Profile Image / Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-[#1a5cff]" />
                <h3 className="font-bold text-sm text-slate-900">Update Profile Picture</h3>
              </div>
              <button onClick={() => setShowAvatarModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAvatar} className="space-y-4 text-xs">
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#1a5cff] shadow-md bg-white">
                  <img
                    src={avatarInput || FALLBACK_AVATAR}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                  />
                </div>
                <span className="text-slate-500 text-[11px]">Preview</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40"
                />
              </div>

              <div>
                <span className="block text-slate-700 font-semibold mb-2">Or Choose from Presets:</span>
                <div className="flex items-center gap-2 justify-center">
                  {presetAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarInput(url)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ${
                        avatarInput === url ? 'border-[#1a5cff] scale-105 ring-2 ring-blue-300' : 'border-slate-200'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAvatar || !avatarInput.trim()}
                  className="px-5 py-2 rounded-xl bg-[#0b1940] text-white font-bold hover:bg-[#1a5cff] disabled:opacity-50"
                >
                  {savingAvatar ? 'Saving...' : 'Save Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
