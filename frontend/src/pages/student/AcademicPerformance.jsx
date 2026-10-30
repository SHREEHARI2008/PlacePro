import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import GpaTrendChart from '../../components/GpaTrendChart';
import {
  GraduationCap,
  PlusCircle,
  CheckCircle2,
  FileText,
  BookOpen
} from 'lucide-react';

export default function AcademicPerformance() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState('');

  // Form State
  const [semester, setSemester] = useState(1);
  const [gpa, setGpa] = useState('');
  const [credits, setCredits] = useState(20);
  const [totalSubjects, setTotalSubjects] = useState(5);
  const [backlogs, setBacklogs] = useState(0);

  const loadData = async () => {
    const studentId = user?.studentId;
    if (!studentId) return;
    try {
      setLoading(true);
      const res = await studentAPI.getProfile(studentId);
      if (res.data?.success) {
        setProfile(res.data.data);
        setRecords(res.data.data.academicRecords || []);
      }
    } catch (err) {
      console.error('Error fetching academic records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSaveSemester = async (e) => {
    e.preventDefault();
    if (!user?.studentId) return;
    try {
      setSubmitting(true);
      const payload = {
        studentId: user.studentId,
        semester: parseInt(semester),
        gpa: parseFloat(gpa),
        credits: parseInt(credits),
        totalSubjects: parseInt(totalSubjects),
        backlogs: parseInt(backlogs),
      };

      const res = await studentAPI.saveAcademicRecord(payload);
      if (res.data?.success) {
        setNotification(`Semester ${semester} record saved! CGPA updated.`);
        setShowModal(false);
        loadData();
      }
    } catch (err) {
      setNotification('Failed to save semester record');
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-lg bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] text-xs flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Academic Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-[#0f172a]">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-[#0f172a]">Academic Record & CGPA</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]">
                Verified Profile
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Roll No: <span className="text-[#0f172a] font-mono">{profile?.rollNumber}</span> • Batch: <span className="text-[#0f172a]">{profile?.batchYear || 2026}</span> • Department: <span className="text-[#0f172a]">{profile?.department}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Semester Result</span>
        </button>
      </div>

      {/* 3 Metric Cards: Overall CGPA, Backlogs, Credits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-500">Cumulative GPA (CGPA)</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-[#0f172a]">
              {profile?.cgpa ? Number(profile.cgpa).toFixed(2) : '0.00'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 10.0</span>
          </div>
          <span className="inline-block mt-2 text-[11px] text-[#15803d] font-semibold">
            {(profile?.cgpa || 0) >= 7.5 ? 'Eligible for Top Tier Companies' : 'Placement Eligible'}
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-500">Active Backlogs</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className={`text-3xl font-extrabold ${(profile?.activeBacklogs || 0) === 0 ? 'text-[#15803d]' : 'text-[#991b1b]'}`}>
              {profile?.activeBacklogs || 0}
            </span>
            <span className="text-xs text-slate-400 font-semibold">arrears</span>
          </div>
          <span className="inline-block mt-2 text-[11px] text-slate-500 font-medium">
            {(profile?.activeBacklogs || 0) === 0 ? 'Clean academic record ✓' : 'Requires clearance before joining'}
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-500">Total Credits Earned</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-[#0f172a]">
              {records.reduce((acc, r) => acc + (r.credits || 0), 0)}
            </span>
            <span className="text-xs text-slate-400 font-semibold">credits</span>
          </div>
          <span className="inline-block mt-2 text-[11px] text-[#2563eb] font-semibold">
            Graduation threshold: 160 credits
          </span>
        </div>
      </div>

      {/* Progression Graph & Semester Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Semester Progression Chart */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-2">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#0f172a]" />
              <h3 className="text-sm font-bold text-[#0f172a]">Semester GPA Progression</h3>
            </div>
            <span className="text-xs text-slate-500">{records.length} Semesters Logged</span>
          </div>

          <GpaTrendChart records={records} />

          <p className="text-[11px] text-slate-500 mt-2 text-center">
            Consistent upward trajectory improves shortlisting priority during technical screening.
          </p>
        </div>

        {/* Semester Breakdown Table */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-[#0f172a] pb-3 border-b border-slate-200 mb-3">
            Semester Transcript Breakdown
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[12px] tracking-[0.05em]">
                  <th className="py-2.5 px-3 font-semibold">Semester</th>
                  <th className="py-2.5 px-3 font-semibold">GPA</th>
                  <th className="py-2.5 px-3 font-semibold">Credits</th>
                  <th className="py-2.5 px-3 font-semibold">Subjects</th>
                  <th className="py-2.5 px-3 font-semibold">Backlogs</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-[#f8fafc]">
                    <td className="py-2.5 px-3 font-semibold text-[#0f172a]">Semester {r.semester}</td>
                    <td className="py-2.5 px-3 font-bold text-[#2563eb]">{r.gpa.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-500">{r.credits}</td>
                    <td className="py-2.5 px-3 text-slate-500">{r.totalSubjects}</td>
                    <td className="py-2.5 px-3">
                      {r.backlogs === 0 ? (
                        <span className="text-[#15803d] font-semibold">0</span>
                      ) : (
                        <span className="text-[#991b1b] font-bold">{r.backlogs}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]">
                        Passed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Placement Resume Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 mb-4">
          <FileText className="w-4 h-4 text-[#0f172a]" />
          <h3 className="text-sm font-bold text-[#0f172a]">Placement Resume</h3>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#0f172a]">
              {profile?.name ? `${profile.name.replace(/\s+/g, '_')}_Official_Resume.pdf` : 'Placement_Resume.pdf'}
            </p>
            <p className="text-[11px] text-slate-500">Official resume document filed with institutional placement cell</p>
          </div>
          <a
            href={profile?.resumeDriveUrl || profile?.resumeUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-[#0f172a] hover:bg-[#1a5cff] text-white text-xs font-medium transition-all text-center"
          >
            View Official Resume
          </a>
        </div>
      </div>

      {/* Modal: Add/Update Semester GPA */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full border border-slate-200 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-[#0f172a]">Log Semester Academic Record</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-[#0f172a] text-xs font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSemester} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Semester Number (1 - 8)</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">GPA (0.00 - 10.00)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Credits Earned</label>
                  <input
                    type="number"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Total Subjects</label>
                  <input
                    type="number"
                    value={totalSubjects}
                    onChange={(e) => setTotalSubjects(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Backlogs in this Semester</label>
                <input
                  type="number"
                  min="0"
                  value={backlogs}
                  onChange={(e) => setBacklogs(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#0f172a] hover:bg-slate-800 text-white font-bold transition-all shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Save & Update CGPA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
