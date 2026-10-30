import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { skillBoosterAPI } from '../../services/api';
import {
  ExternalLink,
  CheckCircle2,
  Circle,
  Zap,
  UserCheck,
  RefreshCw,
  Trophy,
  ArrowRight,
  Code2,
  Sparkles,
  Calendar
} from 'lucide-react';

export default function SkillBooster() {
  const { user } = useAuth();
  const [batch, setBatch] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingQNum, setTogglingQNum] = useState(null);
  const activeBatchIdRef = useRef(null);

  const fetchSkillBooster = async (isBackground = false) => {
    if (!user) return;
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      const studentId = user.studentId || null;
      const userId = user.userId || user.id || null;
      const res = await skillBoosterAPI.getCurrent({ studentId, userId });

      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        const newBatchId = data.id;

        // Detect if batch changed while user was viewing
        if (activeBatchIdRef.current !== null && activeBatchIdRef.current !== newBatchId) {
          console.log(`[SkillBooster] New batch published by mentor! Switching from batch ${activeBatchIdRef.current} to ${newBatchId}`);
        }

        activeBatchIdRef.current = newBatchId;
        setBatch(data);
        setQuestions(data.questions || []);
      }
    } catch (err) {
      console.error('Error fetching skill booster batch:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSkillBooster(false);

    // Auto-poll every 25 seconds for new mentor-published batches
    const interval = setInterval(() => {
      fetchSkillBooster(true);
    }, 25000);

    return () => clearInterval(interval);
  }, [user]);

  const handleToggle = async (questionNumber, currentStatus) => {
    if (!batch || togglingQNum !== null) return;
    const studentId = user?.studentId || null;
    const userId = user?.userId || user?.id || null;
    const targetState = !currentStatus;

    // Optimistic UI update
    setTogglingQNum(questionNumber);
    setQuestions((prev) =>
      prev.map((q) =>
        q.questionNumber === questionNumber ? { ...q, isCompleted: targetState } : q
      )
    );

    // Update batch completed count optimistically
    const nextCompletedCount = questions.reduce((acc, q) => {
      if (q.questionNumber === questionNumber) return acc + (targetState ? 1 : 0);
      return acc + (q.isCompleted ? 1 : 0);
    }, 0);

    setBatch((prev) => prev ? ({
      ...prev,
      completedCount: nextCompletedCount,
      progressPercentage: Math.round((nextCompletedCount / 6) * 100)
    }) : null);

    try {
      const res = await skillBoosterAPI.toggleQuestion({
        studentId,
        userId,
        batchId: batch.id,
        questionNumber,
        isCompleted: targetState
      });

      if (res.data?.success && res.data.data) {
        const updated = res.data.data;
        setBatch((prev) => prev ? ({
          ...prev,
          completedCount: updated.completedCount,
          progressPercentage: updated.progressPercentage
        }) : null);
      }
    } catch (err) {
      console.error('Failed to toggle question status:', err);
      // Revert on failure
      setQuestions((prev) =>
        prev.map((q) =>
          q.questionNumber === questionNumber ? { ...q, isCompleted: currentStatus } : q
        )
      );
    } finally {
      setTogglingQNum(null);
    }
  };

  const completedCount = batch?.completedCount ?? questions.filter((q) => q.isCompleted).length;
  const totalCount = 6;
  const progressPct = batch?.progressPercentage ?? Math.round((completedCount / totalCount) * 100);
  const isAllCompleted = completedCount === totalCount;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently Updated';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card with Prominent Module Progress Indicator */}
      <div className="rounded-2xl bg-[#0b1940] p-6 sm:p-8 border border-slate-800 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative background accent */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Mentor-Curated Placement Challenge</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Skill Booster: Daily 6-Question Challenge
            </h1>
            {/* Mentor Attribution & Timestamp */}
            {batch && (
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80 text-slate-300 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Curated by: <strong className="text-white">{batch.updatedByMentorName || 'Faculty Placement Coordinator'}</strong></span>
                </span>
                <span className="flex items-center space-x-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Published {formatDate(batch.updatedAt || batch.createdAt)}</span>
                </span>
              </div>
            )}
          </div>

          {/* Module Progress Box at the Top */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/90 text-left shrink-0 w-full lg:w-72 shadow-lg backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300 uppercase tracking-wider text-[11px]">Module Progress</span>
              <span className="text-emerald-400 font-bold text-sm">{progressPct}%</span>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden mb-2.5 border border-slate-700/60 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${isAllCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                  }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-200 font-bold">
                {completedCount} / {totalCount} Completed
              </span>
              <button
                type="button"
                onClick={() => fetchSkillBooster(true)}
                disabled={refreshing}
                className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1 font-medium disabled:opacity-50"
                title="Check for mentor updates"
              >
                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
              </button>
            </div>

            {/* Achievement Milestone Tag */}
            {isAllCompleted ? (
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Daily Challenge Completed! 🎉</span>
              </div>
            ) : (
              <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{totalCount - completedCount} questions remaining</span>
                <span className="text-slate-500">Batch #{batch?.id || 1}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Questions Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Today's 6 Curated Questions</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#1a5cff]">
              6 Questions
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click "Solve Problem" to open each challenge, then toggle the completion checkbox once solved.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchSkillBooster(true)}
          disabled={loading || refreshing}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-slate-200 rounded-md" />
                <div className="h-6 w-6 bg-slate-200 rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-slate-200 rounded-md" />
              <div className="h-9 w-full bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1a5cff] flex items-center justify-center mx-auto">
            <Code2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Active Challenge Set Available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your faculty mentors will publish today's set of 6 coding questions shortly. Check back soon!
          </p>
        </div>
      ) : (
        /* Questions Grid: Clean 6-card display */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q) => {
            const isDone = !!q.isCompleted;
            const isPendingThis = togglingQNum === q.questionNumber;

            return (
              <div
                key={q.questionNumber || q.id}
                className={`rounded-2xl p-5 border transition-all duration-200 relative flex flex-col justify-between ${isDone
                    ? 'border-emerald-200 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-xs hover:shadow-md'
                  }`}
              >
                <div>
                  {/* Top Bar: Question Number Badge & Solved Status Chip */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-xs font-bold tracking-tight ${isDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Question #{q.questionNumber}</span>
                    </span>

                    {isDone ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Question Title */}
                  <h3
                    className={`text-sm sm:text-base font-bold leading-snug tracking-tight mb-2 ${isDone ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-900'
                      }`}
                  >
                    {q.title}
                  </h3>
                </div>

                {/* Bottom Actions: Problem Link & Interactive Completion Checkbox */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* External Problem Link */}
                  <a
                    href={q.problemLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1a5cff] bg-blue-50/80 hover:bg-blue-100 border border-blue-200/60 transition-colors group"
                    title={`Open ${q.title} on problem portal`}
                  >
                    <span>Solve Problem</span>
                    <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>

                  {/* Interactive Checkbox Button */}
                  <button
                    type="button"
                    onClick={() => handleToggle(q.questionNumber, isDone)}
                    disabled={isPendingThis}
                    className={`inline-flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${isDone
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      } ${isPendingThis ? 'opacity-60 cursor-wait' : ''}`}
                    title={isDone ? 'Click to unmark as completed' : 'Mark as completed'}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 text-slate-400" />
                        <span>Mark as Completed</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Motivational Bottom Strip */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 p-5 border border-blue-100/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-700">
        <div className="flex items-center space-x-3 text-left">
          <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-blue-200/60 flex items-center justify-center shrink-0 text-[#1a5cff]">
            <Sparkles className="w-5 h-5 text-[#1a5cff]" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Placement Preparation Tip</p>
            <p className="text-[11px] text-slate-600">
              Consistency is key. Finishing all 6 daily questions puts your profile in the top percentile during visiting campus recruiter drives.
            </p>
          </div>
        </div>
        <div className="shrink-0 font-mono text-[11px] font-bold text-slate-500">
          Set #{batch?.id || 1} • {completedCount}/6 Done
        </div>
      </div>
    </div>
  );
}
