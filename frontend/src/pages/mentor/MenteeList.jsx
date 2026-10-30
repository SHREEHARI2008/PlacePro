import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mentorAPI, studentAPI } from '../../services/api';
import LeetCodeDonut from '../../components/LeetCodeDonut';
import GpaTrendChart from '../../components/GpaTrendChart';
import {
  Users,
  Search,
  Code2,
  MessageSquare,
  Send,
  CheckCircle2,
  ChevronRight,
  Flame,
  ExternalLink,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function MenteeList() {
  const { user } = useAuth();
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Feedback form state
  const [feedbackText, setFeedbackText] = useState('');
  const [focusArea, setFocusArea] = useState('Data Structures & Algorithms');
  const [rating, setRating] = useState(5);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120';

  const loadMentees = async () => {
    const mentorId = user?.mentorId;
    if (!mentorId) return;
    try {
      setLoading(true);
      const res = await mentorAPI.getMentees(mentorId);
      if (res.data?.success) {
        setMentees(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching mentees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentees();
  }, [user]);

  const handleInspectStudent = async (student) => {
    setSelectedStudent(student);
    try {
      setLoadingDetails(true);
      const res = await studentAPI.getDashboard(student.studentId);
      if (res.data?.success) {
        setStudentDetails(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim() || !selectedStudent || !user?.mentorId) return;
    try {
      setSubmittingFeedback(true);
      const payload = {
        mentorId: user.mentorId,
        studentId: selectedStudent.studentId,
        feedbackText: feedbackText.trim(),
        focusArea,
        rating: parseInt(rating),
      };
      const res = await mentorAPI.addFeedback(payload);
      if (res.data?.success) {
        setFeedbackSuccess('Feedback submitted to student!');
        setFeedbackText('');
        handleInspectStudent(selectedStudent);
      }
    } catch (err) {
      setFeedbackSuccess('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
      setTimeout(() => setFeedbackSuccess(''), 4000);
    }
  };

  const filteredMentees = mentees.filter(
    (m) =>
      (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.rollNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.department || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-50 text-[#1a5cff]">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-[#0b1940]">Live Mentee LeetCode Tracking</h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time tracking of coding consistency, daily challenge completion, and academic dossiers for assigned mentees at ABC College.
          </p>
        </div>

        <div className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
          Supervising <span className="text-[#0b1940] font-bold">{mentees.length}</span> Mentees
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, register number, or department..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[#cbd5e1] text-xs text-[#0b1940] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Showing {filteredMentees.length} of {mentees.length} mentees
        </span>
      </div>

      {/* Requirement 5: Live Mentee LeetCode Tracking Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3.5 px-4">Student &amp; Register No</th>
                <th className="py-3.5 px-4">Dept &amp; Year</th>
                <th className="py-3.5 px-4">Resume Link</th>
                <th className="py-3.5 px-4">Total Solved (E / M / H)</th>
                <th className="py-3.5 px-4">Current Streak</th>
                <th className="py-3.5 px-4">Solved Today</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-[#1a5cff] border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading mentee live metrics...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMentees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No assigned mentees found matching your query.
                  </td>
                </tr>
              ) : (
                filteredMentees.map((m) => {
                  const lc = m.leetCodeStats || {};
                  const solvedToday = Boolean(lc.solvedToday);
                  const easy = lc.easySolved || 0;
                  const med = lc.mediumSolved || 0;
                  const hard = lc.hardSolved || 0;
                  const total = lc.totalSolved || 0;
                  const streak = lc.streakDays || 0;
                  const resumeUrl = m.resumeDriveUrl;

                  return (
                    <tr key={m.studentId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Column 1: Student Name & Register Number */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {/* Avatar container fixed size, overflow-hidden, object-cover */}
                          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                            <img
                              src={m.avatarUrl || FALLBACK_AVATAR}
                              alt={m.name}
                              className="w-full h-full object-cover object-center"
                              onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{m.name}</div>
                            <div className="font-mono text-[11px] text-slate-500">
                              {m.rollNumber || m.registerNumber || 'REG-PENDING'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Department & Year */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{m.department || 'CSE'}</div>
                        <div className="text-[11px] text-slate-500">Batch of {m.batchYear || 2026}</div>
                      </td>

                      {/* Column 3: Resume Link (clickable) */}
                      <td className="py-3 px-4">
                        {resumeUrl ? (
                          <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#1a5cff] hover:bg-blue-100 font-semibold text-[11px] border border-blue-200 transition-all"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View Resume</span>
                            <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not Uploaded</span>
                        )}
                      </td>

                      {/* Column 4: Total Problems Solved (Easy / Medium / Hard) */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 text-sm">
                            {total} <span className="text-[11px] font-normal text-slate-500">problems</span>
                          </div>
                          <div className="flex items-center space-x-1 text-[10px] font-mono">
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200" title="Easy">
                              E: {easy}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200" title="Medium">
                              M: {med}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200" title="Hard">
                              H: {hard}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 5: Current Streak */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{streak} Days</span>
                        </div>
                      </td>

                      {/* Column 6: "Solved Today" Status Badge */}
                      <td className="py-3 px-4">
                        {solvedToday ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <Clock className="w-3.5 h-3.5 text-rose-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleInspectStudent(m)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1a5cff] hover:text-white text-slate-700 font-semibold text-xs transition-all border border-slate-200 inline-flex items-center space-x-1"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Student Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full border border-slate-200 shadow-xl space-y-5 my-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                  <img
                    src={selectedStudent.avatarUrl || FALLBACK_AVATAR}
                    alt={selectedStudent.name}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0b1940]">{selectedStudent.name}</h2>
                  <p className="text-xs text-slate-500">
                    Roll No: <span className="text-[#0b1940] font-mono font-bold">{selectedStudent.rollNumber}</span> • Dept: <span className="text-[#0b1940] font-semibold">{selectedStudent.department}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                <div className="w-6 h-6 border-2 border-[#1a5cff] border-t-transparent rounded-full animate-spin"></div>
                <span>Loading complete student dossier...</span>
              </div>
            ) : (
              <div className="space-y-5">
                {/* 3 Metric Cards: Placement Readiness Score, Cumulative CGPA, Active Backlogs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Placement Readiness</span>
                    <div className="text-2xl font-extrabold text-[#1a5cff]">
                      {studentDetails?.readinessScore !== undefined
                        ? studentDetails.readinessScore
                        : Math.min(100, Math.round(((selectedStudent.cgpa || 7.5) / 10) * 50 + Math.min(50, ((selectedStudent.leetCodeStats?.totalSolved || 0) / 200) * 50)))}%
                    </div>
                    <span className="text-[10px] text-blue-600 font-semibold">Live Readiness Metric</span>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Cumulative CGPA</span>
                    <div className="text-2xl font-extrabold text-purple-900">
                      {selectedStudent.cgpa ? Number(selectedStudent.cgpa).toFixed(2) : (studentDetails?.student?.cgpa ? Number(studentDetails.student.cgpa).toFixed(2) : '0.00')}
                    </div>
                    <span className="text-[10px] text-purple-600 font-semibold">Out of 10.0 scale</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Backlogs</span>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {selectedStudent.activeBacklogs || 0}
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {(selectedStudent.activeBacklogs || 0) === 0 ? 'Clear Academic Standing' : 'Requires Clearance'}
                    </span>
                  </div>
                </div>

                {/* 2-Column Analytics: LeetCode Donut + GPA Progression */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                    <h4 className="text-xs font-bold text-[#0b1940] mb-2">LeetCode Breakdown &amp; Progress</h4>
                    {(() => {
                      const lc = studentDetails?.leetcodeStats || selectedStudent?.leetCodeStats || {};
                      return (
                        <>
                          <LeetCodeDonut
                            stats={lc}
                            easy={lc.easySolved}
                            medium={lc.mediumSolved}
                            hard={lc.hardSolved}
                            total={lc.totalSolved}
                          />
                          <div className="text-[11px] text-slate-600 mt-2 text-center">
                            Streak: <strong className="text-amber-600">{lc.streakDays || 0} Days</strong> • Global Rank: <strong className="text-slate-800">#{lc.globalRanking ? lc.globalRanking.toLocaleString() : 'N/A'}</strong>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-[#0b1940] mb-1">Academic GPA Progression</h4>
                    <GpaTrendChart records={studentDetails?.academicRecords || []} />
                    <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                      <span>Total Logged: <strong>{studentDetails?.academicRecords?.length || 0} Semesters</strong></span>
                      <span>Degree: <strong className="text-[#0b1940]">{selectedStudent.degree || 'B.E CSE'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Applications & Placement Drives List with Statuses */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-[#0b1940]">Applied Placement Drives &amp; Statuses</h4>
                    <span className="text-[11px] font-bold text-slate-500">
                      {(studentDetails?.recentApplications?.length || 0)} Drives Applied
                    </span>
                  </div>

                  {studentDetails?.recentApplications?.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {studentDetails.recentApplications.map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white text-xs border border-slate-200 shadow-2xs"
                        >
                          <div>
                            <span className="font-bold text-[#0b1940]">{app.companyName}</span>
                            <span className="text-slate-500 text-[11px] ml-2">({app.jobRole})</span>
                            {app.appliedDate && (
                              <div className="text-[10px] text-slate-400">Applied on: {app.appliedDate}</div>
                            )}
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              app.status === 'SELECTED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : app.status === 'SHORTLISTED'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : app.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {app.status || 'APPLIED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs bg-white rounded-lg border border-slate-200/60">
                      Student has not applied to any placement drives yet.
                    </div>
                  )}
                </div>

                {/* Assigned Assessments & Completion Tracking */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-[#1a5cff]" />
                      <h4 className="text-xs font-bold text-[#0b1940]">Assigned Assessments &amp; Completion Status</h4>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      {studentDetails?.assignedAssessments?.filter((a) => a.completed).length || 0} / {studentDetails?.assignedAssessments?.length || 0} Completed
                    </span>
                  </div>

                  {studentDetails?.assignedAssessments?.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {studentDetails.assignedAssessments.map((a) => (
                        <div
                          key={a.assessmentId}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white text-xs border border-slate-200 shadow-2xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#0b1940]">{a.title}</span>
                            <div className="text-[10px] text-slate-500 flex items-center space-x-2">
                              <span>Dept: <strong>{a.targetDept || 'All'}</strong></span>
                              {a.dueDate && <span>• Due: {a.dueDate}</span>}
                              {a.completed && a.completedAt && (
                                <span className="text-emerald-600 font-medium">• Completed: {a.completedAt.substring(0, 10)}</span>
                              )}
                            </div>
                          </div>
                          {a.completed ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>Pending</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs bg-white rounded-lg border border-slate-200/60">
                      No department assessments assigned to this student yet.
                    </div>
                  )}
                </div>

                {/* Post Feedback / Mentorship Guidance Form */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-[#0b1940]" />
                    <h4 className="text-xs font-bold text-[#0b1940]">Post Mentorship Feedback &amp; Action Plan</h4>
                  </div>

                  {feedbackSuccess && (
                    <div className="mb-3 p-3 rounded-lg bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] text-xs flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
                      <span>{feedbackSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendFeedback} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Focus Area</label>
                        <select
                          value={focusArea}
                          onChange={(e) => setFocusArea(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0b1940] focus:outline-none focus:ring-2 focus:ring-[#1a5cff]"
                        >
                          <option>Data Structures &amp; Algorithms</option>
                          <option>Dynamic Programming &amp; Graphs</option>
                          <option>Resume &amp; Project Articulation</option>
                          <option>Mock Interview Performance</option>
                          <option>Academic Recovery &amp; Backlog Clearance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Rating / Readiness (1-5)</label>
                        <select
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0b1940] focus:outline-none focus:ring-2 focus:ring-[#1a5cff]"
                        >
                          <option value="5">5 - Excellent (Tier-1 Ready)</option>
                          <option value="4">4 - Good (Consistent progress)</option>
                          <option value="3">3 - Average (Needs focus)</option>
                          <option value="2">2 - Below Average (Intervention needed)</option>
                          <option value="1">1 - Critical (Backlogs &amp; low activity)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Mentorship Notes &amp; Specific Advice</label>
                      <textarea
                        rows={3}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="e.g., Maintain 1 problem daily to sustain placement streak. Refine LeetCode medium questions."
                        required
                        className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0b1940] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="px-5 py-2.5 rounded-lg bg-[#0b1940] hover:bg-[#1a5cff] text-white font-bold transition-all flex items-center space-x-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingFeedback ? 'Submitting...' : 'Post Mentorship Feedback'}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
