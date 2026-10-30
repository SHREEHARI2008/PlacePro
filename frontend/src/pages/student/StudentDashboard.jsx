import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI, leetcodeAPI, assessmentAPI } from '../../services/api';
import campusSunset from '../../assets/campus-sunset.svg';
import LeetCodeDonut from '../../components/LeetCodeDonut';
import GpaTrendChart from '../../components/GpaTrendChart';
import {
  Award,
  BookOpen,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  TrendingUp,
  Clock,
  ExternalLink,
  UserCheck
} from 'lucide-react';

export default function StudentDashboard({ setActiveTab }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleToggleAssessment = async (assessmentId, currentStatus) => {
    if (!user?.studentId) return;
    const nextStatus = !currentStatus;
    // Optimistic update
    setData((prev) => {
      if (!prev) return prev;
      const updatedAssessments = (prev.assignedAssessments || []).map((a) =>
        a.assessmentId === assessmentId ? { ...a, completed: nextStatus } : a
      );
      return { ...prev, assignedAssessments: updatedAssessments };
    });
    try {
      await assessmentAPI.toggleAssessmentCompletion({
        assessmentId,
        studentId: user.studentId,
        completed: nextStatus
      });
    } catch (err) {
      console.error('Failed to update assessment completion:', err);
      fetchDashboard();
    }
  };

  const fetchDashboard = async () => {
    const studentId = user?.studentId;
    if (!studentId) return;
    try {
      setLoading(true);
      const res = await studentAPI.getDashboard(studentId);
      if (res.data?.success) {
        setData(res.data.data);
        const handle = res.data.data?.student?.leetcodeUsername || user?.leetcodeUsername;
        if (handle) {
          // Live sync LeetCode in background on page enter to ensure live tracking
          leetcodeAPI.syncProfile(studentId, handle).then(syncRes => {
            if (syncRes.data?.success) {
              setData(prev => prev ? { ...prev, leetcodeStats: syncRes.data.data } : prev);
            }
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#1a5cff] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading placement dashboard...</p>
        </div>
      </div>
    );
  }

  const s = data?.student || {};
  const lc = data?.leetcodeStats || {};
  const readiness = data?.readinessScore || 88;
  const records = data?.academicRecords || [];
  const applications = data?.recentApplications || [];
  const assessments = data?.assignedAssessments || [];
  const maxStreak = lc?.maxStreak || lc?.streakDays || 0;
  const isSolvedToday = Boolean(lc?.solvedToday);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-150">

      {/* Daily LeetCode Solving Notification Banner */}
      {isSolvedToday ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-950">
                ✓ Today's LeetCode Challenge Completed!
              </p>
              <p className="text-xs text-emerald-700">
                Great consistency! Your daily practice directly boosts your placement readiness and recruiter visibility.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-emerald-100/80 rounded-lg text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed Today</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-950">
                Daily LeetCode coding reminder: Don't forget to solve your daily LeetCode problem today!
              </p>
              <p className="text-xs text-amber-700">
                Placement drives prioritize candidates with consistent daily problem solving. Solve today's challenge to stay sharp!
              </p>
            </div>
          </div>
          <a
            href={s.leetcodeUsername ? `https://leetcode.com/u/${s.leetcodeUsername}/` : 'https://leetcode.com/problemset/'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1 shrink-0"
          >
            <span>Solve Now</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Title Row (Cleaned up: Removed static timestamp and subTab pills) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Placement readiness and recruitment analytics overview
          </p>
        </div>
      </div>

      {/* Student Banner Card with Sunset Landscape Illustration */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Landscape Sunset Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#582046]">
          <img
            src={campusSunset}
            alt="Campus Sunset Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Student Profile Identity Details & Meta Row (Avatar removed per requirement) */}
        <div className="px-6 sm:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="text-left space-y-0.5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                {s.name || user?.name || 'Student Name'}
              </h2>
              <p className="text-xs text-slate-500 font-medium font-mono">
                {s.email || 'student@abccollege.edu'}
              </p>
            </div>
          </div>

          {/* Metadata Badges Bar */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-600 border-t border-slate-100 pt-4">
            <div>
              <span className="text-slate-400">Register Number : </span>
              <span className="font-bold text-slate-800 font-mono">{s.rollNumber || 'REG-PENDING'}</span>
            </div>
            <span className="text-slate-300 hidden md:inline">|</span>
            <div>
              <span className="text-slate-400">Degree : </span>
              <span className="font-bold text-slate-800">{s.degree || 'B.E CSE'}</span>
            </div>
            <span className="text-slate-300 hidden md:inline">|</span>
            <div>
              <span className="text-slate-400">Batch : </span>
              <span className="font-bold text-slate-800">{s.batchYear || 2026}</span>
            </div>
            <span className="text-slate-300 hidden md:inline">|</span>
            <div>
              <span className="text-slate-400">College : </span>
              <span className="font-bold text-slate-800">ABC College</span>
            </div>
            {s.mentorName && (
              <>
                <span className="text-slate-300 hidden md:inline">|</span>
                <div>
                  <span className="text-slate-400">Assigned Mentor : </span>
                  <span className="font-bold text-[#1a5cff]">{s.mentorName}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Placement Preparation Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Readiness Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Placement Readiness</span>
            <div className="text-2xl font-bold text-[#1a5cff]">{readiness}%</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>High Recruiter Priority</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#1a5cff]">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Cumulative CGPA */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cumulative CGPA</span>
            <div className="text-2xl font-bold text-slate-900">{s.cgpa ? Number(s.cgpa).toFixed(2) : '0.00'}</div>
            <div className="text-[11px] text-slate-500">Tier-1 Cutoff: 8.00</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: LeetCode Solved */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LeetCode Solved</span>
            <div className="text-2xl font-bold text-slate-900">{lc.totalSolved || 0}</div>
            <div className="text-[11px] text-purple-600 font-semibold flex items-center space-x-1">
              <Trophy className="w-3.5 h-3.5 text-purple-600" />
              <span>Max Streak: {maxStreak} Days</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Code2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Active Backlogs */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Backlogs</span>
            <div className="text-2xl font-bold text-emerald-600">{s.historyOfArrears || 0}</div>
            <div className="text-[11px] text-emerald-600 font-semibold">
              {(s.historyOfArrears || 0) === 0 ? '100% Eligible for All Drives' : 'Check Eligibility'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LeetCode Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">LeetCode Problem Breakdown</h3>
              <p className="text-[11px] text-slate-500">Live handle: @{s.leetcodeUsername || 'Not Configured'}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#dcfce7] text-[#15803d]">
              Live Tracked
            </span>
          </div>
          <LeetCodeDonut
            stats={lc}
            easy={lc?.easySolved}
            medium={lc?.mediumSolved}
            hard={lc?.hardSolved}
            total={lc?.totalSolved}
          />
        </div>

        {/* CGPA Progression Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Semester GPA Progression</h3>
              <p className="text-[11px] text-slate-500">{s.degree || 'Engineering'} ({s.department || 'All Departments'})</p>
            </div>
            <button
              onClick={() => {
                if (setActiveTab) setActiveTab('academics');
                navigate('/student/academics');
              }}
              className="text-xs font-semibold text-[#1a5cff] hover:underline"
            >
              View Transcript
            </button>
          </div>
          <GpaTrendChart records={records} />
        </div>
      </div>

      {/* Requirement 5: Assigned Assessments Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Assigned Assessments</h3>
            <p className="text-xs text-slate-500">Official technical tests and assignments posted by faculty mentors</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#eff6ff] text-[#1a5cff] border border-[#dbeafe]">
            {assessments.length} Active
          </span>
        </div>

        {assessments.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-xs">
            No pending assessments assigned to your department at this moment. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((a) => (
              <div
                key={a.assessmentId}
                className="p-5 rounded-xl bg-white border border-slate-200/80 hover:border-[#1a5cff]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">{a.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                      {a.targetDept || 'All Depts'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{a.description || 'No description provided.'}</p>
                  <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mentor: <strong className="text-slate-700">{a.mentorName || 'Faculty'}</strong></span>
                    </div>
                    {a.dueDate && (
                      <div className="flex items-center space-x-1.5 text-amber-700">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Due: {a.dueDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Completion Status Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!a.completed}
                      onChange={() => handleToggleAssessment(a.assessmentId, !!a.completed)}
                      className="w-4 h-4 rounded border-slate-300 text-[#1a5cff] focus:ring-[#1a5cff]/30 cursor-pointer accent-[#1a5cff]"
                    />
                    <span className={a.completed ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                      {a.completed ? 'Completed' : 'Mark Complete'}
                    </span>
                  </label>
                  {a.completed && (
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Done</span>
                    </span>
                  )}
                </div>

                {!(a.completed || a.is_completed) && (
                  <a
                    href={a.testLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-[#1a5cff] hover:bg-[#1546c7] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5"
                  >
                    <span>Start Assessment</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
