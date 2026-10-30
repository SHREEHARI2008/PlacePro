import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { skillBoosterAPI } from '../../services/api';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Calendar,
  UserCheck,
  Code2,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

const SAMPLE_QUESTION_SETS = [
  {
    name: 'Top Product Company DSA Pack (Google, Microsoft, Amazon)',
    questions: [
      { title: 'Two Sum & Pair Target Search', link: 'https://leetcode.com/problems/two-sum/' },
      { title: 'Valid Parentheses & Bracket Matching', link: 'https://leetcode.com/problems/valid-parentheses/' },
      { title: 'Merge Intervals & Overlapping Spans', link: 'https://leetcode.com/problems/merge-intervals/' },
      { title: 'Lowest Common Ancestor of a Binary Tree', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/' },
      { title: 'Longest Substring Without Repeating Characters', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { title: 'Coin Change & Optimal DP Partitioning', link: 'https://leetcode.com/problems/coin-change/' }
    ]
  },
  {
    name: 'Advanced Placement Prep Pack (Dynamic Programming & Graphs)',
    questions: [
      { title: 'Climbing Stairs (DP 1D Foundations)', link: 'https://leetcode.com/problems/climbing-stairs/' },
      { title: 'Kth Largest Element in an Array (Heap / Priority Queue)', link: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
      { title: 'Course Schedule (Topological Sort & Graph Cycle Detection)', link: 'https://leetcode.com/problems/course-schedule/' },
      { title: 'Binary Tree Level Order Traversal (BFS & Queue)', link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
      { title: 'Subarray Sum Equals K (Prefix Sum + Hash Map)', link: 'https://leetcode.com/problems/subarray-sum-equals-k/' },
      { title: 'Maximum Subarray (Kadane’s Linear Algorithm)', link: 'https://leetcode.com/problems/maximum-subarray/' }
    ]
  }
];

export default function MentorSkillBooster() {
  const { user } = useAuth();
  const [currentBatch, setCurrentBatch] = useState(null);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Exactly 6 questions state
  const [questionsForm, setQuestionsForm] = useState([
    { title: '', link: '' },
    { title: '', link: '' },
    { title: '', link: '' },
    { title: '', link: '' },
    { title: '', link: '' },
    { title: '', link: '' },
  ]);

  const loadCurrentBatch = async () => {
    try {
      setLoadingCurrent(true);
      const res = await skillBoosterAPI.getCurrent({});
      if (res.data?.success && res.data.data) {
        setCurrentBatch(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching current active batch:', err);
    } finally {
      setLoadingCurrent(false);
    }
  };

  useEffect(() => {
    loadCurrentBatch();
  }, []);

  const handleInputChange = (index, field, value) => {
    setQuestionsForm((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const copyCurrentIntoForm = () => {
    if (!currentBatch?.questions || currentBatch.questions.length === 0) return;
    const copied = currentBatch.questions.slice(0, 6).map((q) => ({
      title: q.title || '',
      link: q.problemLink || ''
    }));
    // Pad to 6 if needed
    while (copied.length < 6) {
      copied.push({ title: '', link: '' });
    }
    setQuestionsForm(copied);
    setSuccessMsg('Loaded current live questions into the editor form.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const applySampleSet = (sample) => {
    if (!sample?.questions || sample.questions.length !== 6) return;
    setQuestionsForm(sample.questions.map((q) => ({ title: q.title, link: q.link })));
    setSuccessMsg(`Loaded template: "${sample.name}"`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const clearForm = () => {
    setQuestionsForm([
      { title: '', link: '' },
      { title: '', link: '' },
      { title: '', link: '' },
      { title: '', link: '' },
      { title: '', link: '' },
      { title: '', link: '' },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    for (let i = 0; i < 6; i++) {
      const q = questionsForm[i];
      if (!q.title.trim()) {
        setErrorMsg(`Question #${i + 1} Name/Title is required.`);
        return;
      }
      if (!q.link.trim()) {
        setErrorMsg(`Question #${i + 1} Problem Link/URL is required.`);
        return;
      }
      if (!/^https?:\/\//i.test(q.link.trim()) && !q.link.trim().includes('leetcode.com')) {
        setErrorMsg(`Question #${i + 1} Link must be a valid URL (e.g. https://leetcode.com/problems/...).`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const mentorId = user?.mentorId || null;
      const formattedQuestions = questionsForm.map((q, idx) => ({
        questionNumber: idx + 1,
        title: q.title.trim(),
        problemLink: q.link.trim()
      }));

      const res = await skillBoosterAPI.publishBatch({
        mentorId,
        questions: formattedQuestions
      });

      if (res.data?.success) {
        setSuccessMsg(
          'Daily 6-Question Skill Booster batch successfully published! It is now live across all Student Portals, and completion checkboxes have been reset.'
        );
        setCurrentBatch(res.data.data);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res.data?.error || 'Failed to publish new challenge set.');
      }
    } catch (err) {
      console.error('Error publishing skill booster batch:', err);
      setErrorMsg(
        err.response?.data?.error || 'Server error while publishing challenge. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#0b1940] p-6 sm:p-8 border border-slate-800 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Faculty Mentor Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Skill Booster
          </h1>
        </div>
      </div>

      {/* Global Impact Alert */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex items-start space-x-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Global Mentor Override Notice</p>
          <p className="text-amber-800 leading-relaxed">
            Submitting this form updates the live Skill Booster challenge for all students across the college in real time. Student checkboxes will automatically reset for the new batch.
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold leading-relaxed">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {/* Current Active Batch Preview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Currently Active Live Set
              </h2>
              {currentBatch && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Batch #{currentBatch.id} Live
                </span>
              )}
            </div>
            {currentBatch && (
              <p className="text-xs text-slate-500 flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Published by: <strong>{currentBatch.updatedByMentorName || 'Faculty Mentor'}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(currentBatch.updatedAt || currentBatch.createdAt).toLocaleString()}</span>
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={loadCurrentBatch}
              disabled={loadingCurrent}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              title="Refresh current batch details"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loadingCurrent ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {currentBatch?.questions?.length > 0 && (
              <button
                type="button"
                onClick={copyCurrentIntoForm}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                title="Copy current questions into editor form below"
              >
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Load into Editor</span>
              </button>
            )}
          </div>
        </div>

        {/* Current Questions Preview Grid */}
        {loadingCurrent ? (
          <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
            Loading current live set...
          </div>
        ) : !currentBatch?.questions || currentBatch.questions.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No live set found in database. Use the form below to publish the initial set!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {currentBatch.questions.map((q) => (
              <div
                key={q.questionNumber || q.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-500 shrink-0 font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                    Q#{q.questionNumber}
                  </span>
                  <a
                    href={q.problemLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1a5cff] hover:text-[#154ecc] shrink-0 p-1 rounded hover:bg-blue-50 transition-colors"
                    title="Open link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="font-bold text-slate-900 leading-snug line-clamp-2">
                  {q.title}
                </p>
                <p className="text-[11px] text-slate-400 truncate font-mono">
                  {q.problemLink}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publish New 6-Question Batch Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-[#1a5cff]" />
              <span>Enter New Daily 6-Question Challenge</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter the Name and Link for each of the 6 questions in separate boxes below.
            </p>
          </div>

          {/* Quick Preset Fill Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Quick Fill:</span>
            {SAMPLE_QUESTION_SETS.map((sample, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => applySampleSet(sample)}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1a5cff] text-[11px] font-semibold transition-colors flex items-center space-x-1"
                title={`Fill with: ${sample.name}`}
              >
                <Sparkles className="w-3 h-3 text-[#1a5cff]" />
                <span>Preset {sIdx + 1}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={clearForm}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold transition-colors flex items-center space-x-1"
              title="Clear all 6 question boxes"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* 6 Questions Form Inputs */}
        <div className="space-y-4">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50/80 hover:bg-slate-50 border border-slate-200 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Question #{idx + 1}</span>
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  Required Question {idx + 1} of 6
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Question Name Box */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Question Name / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={questionsForm[idx].title}
                    onChange={(e) => handleInputChange(idx, 'title', e.target.value)}
                    placeholder={`e.g. ${idx === 0 ? 'Two Sum & Pair Matching' : idx === 1 ? 'Valid Parentheses' : 'Problem Name'}`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium transition-all"
                  />
                </div>

                {/* Question Link Box */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Required Problem Link / URL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={questionsForm[idx].link}
                      onChange={(e) => handleInputChange(idx, 'link', e.target.value)}
                      placeholder="https://leetcode.com/problems/..."
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono text-[11.5px] transition-all"
                    />
                    {questionsForm[idx].link && (
                      <a
                        href={questionsForm[idx].link}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1a5cff] p-0.5 transition-colors"
                        title="Test link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Submit Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 text-left">
            <span>Ready to publish? </span>
            <strong className="text-slate-700">All 6 questions are required.</strong>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-bold text-xs tracking-wide transition-all shadow-md shadow-amber-600/30 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Publishing 6 Questions Live...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-amber-200" />
                <span>Publish 6 Questions Live to Students</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
