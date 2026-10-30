import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assessmentAPI } from '../../services/api';
import emptyClipboard from '../../assets/empty-clipboard.svg';
import {
  SlidersHorizontal,
  ChevronDown,
  Terminal,
  Layers,
  FileText,
  ClipboardCheck,
  Sparkles,
  ExternalLink,
  Clock,
  UserCheck,
  CheckCircle2,
  Code2
} from 'lucide-react';

export default function CompanySpecificTestView() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState('Recently Added');
  const [activeSubTab, setActiveSubTab] = useState('practices'); // 'practices' or 'open_ide'
  const [showIdeModal, setShowIdeModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const compilers = [
    {
      id: 'c',
      name: 'C Programming',
      icon: 'C',
      url: 'https://www.programiz.com/c-programming/online-compiler/',
      description: 'Standard C online compiler & runner'
    },
    {
      id: 'java',
      name: 'Java',
      icon: '☕',
      url: 'https://www.programiz.com/java-programming/online-compiler/',
      description: 'Java JDK online compiler with standard I/O'
    },
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      url: 'https://www.programiz.com/python-programming/online-compiler/',
      description: 'Python 3 interactive online compiler'
    },
    {
      id: 'cpp',
      name: 'C++',
      icon: 'C++',
      url: 'https://www.programiz.com/cpp-programming/online-compiler/',
      description: 'C++ Modern GCC compiler environment'
    }
  ];

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await assessmentAPI.getAssessments({
        department: user?.department,
        studentId: user?.studentId
      });
      if (res.data?.success) {
        setAssessments(res.data.data || []);
      }
    } catch (e) {
      console.error('Error fetching assessments:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompletion = async (assessmentId, currentStatus) => {
    if (!user?.studentId) return;
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setAssessments((prev) =>
      prev.map((a) =>
        a.assessmentId === assessmentId ? { ...a, completed: nextStatus, is_completed: nextStatus } : a
      )
    );
    try {
      await assessmentAPI.toggleAssessmentCompletion({
        assessmentId,
        studentId: user.studentId,
        completed: nextStatus
      });
    } catch (err) {
      console.error('Failed to update assessment completion:', err);
      // Revert if API fails
      fetchAssessments();
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [user]);

  const handleLaunchIde = (url) => {
    const targetUrl = url || compilers.find((c) => c.id === selectedLanguage)?.url;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setShowIdeModal(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Top Header Row with Title, Sort By, Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Assessments &amp; Mock Tests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Technical assessments, department problem sets, and cloud coding environments
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-2.5 pl-4 pr-9 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/30 shadow-xs cursor-pointer"
            >
              <option value="Recently Added">Recently Added</option>
              <option value="Upcoming Deadline">Upcoming Deadline</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchAssessments}
            className="flex items-center space-x-2 bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-2.5 px-4 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Content (70%) vs Right Tests Overview Card (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Section: Practices & Open IDE */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dark Navy Pill Sub-Bar: Practices & Open IDE */}
          <div className="inline-flex p-1.5 rounded-2xl bg-[#0b1940] text-white shadow-md">
            <button
              type="button"
              onClick={() => setActiveSubTab('practices')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'practices'
                  ? 'bg-white/15 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="w-4 h-4 text-[#1a5cff]" />
              <span>Assigned Tests ({assessments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab('open_ide');
                setShowIdeModal(true);
              }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'open_ide'
                  ? 'bg-white/15 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Open IDE / Compiler</span>
            </button>
          </div>

          {/* Dynamic Assessment List or Empty State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-[#1a5cff] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : assessments.length === 0 ? (
            <div className="bg-transparent py-14 flex flex-col items-center justify-center text-center select-none">
              <div className="w-56 h-48 mb-2 drop-shadow-sm">
                <img
                  src={emptyClipboard}
                  alt="No tests found"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-base font-medium text-slate-700">
                No active assessments found
              </p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                You currently have no pending tests posted by mentors. Try launching the Online IDE to practice coding independently!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessments.map((a) => (
                <div
                  key={a.assessmentId}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#1a5cff]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">{a.title}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1a5cff] border border-blue-200 shrink-0">
                        {a.targetDept || 'All Depts'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {a.description || 'Department placement practice assessment.'}
                    </p>

                    <div className="text-[11px] text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Posted by: <strong className="text-slate-700">{a.mentorName || 'Faculty'}</strong></span>
                      </div>
                      {a.dueDate && (
                        <div className="flex items-center space-x-1.5 text-amber-700">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Due Deadline: {a.dueDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assessment Completion Status Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!a.completed}
                        onChange={() => handleToggleCompletion(a.assessmentId, !!a.completed)}
                        className="w-4 h-4 rounded border-slate-300 text-[#1a5cff] focus:ring-[#1a5cff]/30 cursor-pointer accent-[#1a5cff]"
                      />
                      <span className={a.completed ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                        {a.completed ? 'Completed' : 'Mark as Completed'}
                      </span>
                    </label>
                    {a.completed && (
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Submitted</span>
                      </span>
                    )}
                  </div>

                  {/* Conditionally hide Take Assessment button when completed */}
                  {!(a.completed || a.is_completed) && (
                    <a
                      href={a.testLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0b1940] hover:bg-[#1a5cff] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2"
                    >
                      <span>Take Assessment</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Tests Overview (Badges & Super Badges removed) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Assessments Overview
          </h2>

          <div className="space-y-4">
            {/* Tile 1: Tests Enrolled / Available */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#1a5cff] shrink-0 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="font-medium text-xs text-slate-700">Assessments Active</span>
              </div>
              <span className="font-bold text-lg text-[#0b1940]">{assessments.length}</span>
            </div>

            {/* Tile 2: Tests Completed */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <span className="font-medium text-xs text-slate-700">Completed Assessments</span>
              </div>
              <span className="font-bold text-lg text-emerald-600">
                {assessments.filter((a) => a.completed).length}
              </span>
            </div>
          </div>

          {/* Quick Practice Tip Box */}
          <div className="p-4 rounded-xl bg-[#eff6ff]/60 border border-[#dbeafe] text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-[#1a5cff] flex items-center space-x-1">
              <Sparkles className="w-4 h-4" />
              <span>Campus Preparation Tip</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Practice solving algorithmic questions in sandboxed compilers to get comfortable with company technical interview rounds.
            </p>
          </div>
        </div>
      </div>

      {/* Open IDE Modal with Language Selection & Programiz Redirection */}
      {showIdeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Choose Online Compiler / IDE</h3>
                  <p className="text-[11px] text-slate-500">Select your preferred programming language to launch compiler</p>
                </div>
              </div>
              <button
                onClick={() => setShowIdeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Language Selection List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {compilers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedLanguage(c.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${
                    selectedLanguage === c.id
                      ? 'border-[#1a5cff] bg-blue-50/70 shadow-xs ring-2 ring-[#1a5cff]/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-sm flex items-center justify-center text-slate-800 shrink-0">
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-900">{c.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{c.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Launch Button */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-mono">
                Redirects to Programiz Online Compiler
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowIdeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleLaunchIde()}
                  className="px-5 py-2 rounded-xl bg-[#0b1940] hover:bg-[#1a5cff] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <span>Launch IDE</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
