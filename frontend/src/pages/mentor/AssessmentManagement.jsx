import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assessmentAPI } from '../../services/api';
import {
  ClipboardList,
  PlusCircle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Calendar,
  Building,
  Clock,
  BookOpen,
  AlertCircle
} from 'lucide-react';

export default function AssessmentManagement() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDept, setTargetDept] = useState('CSE');
  const [testLink, setTestLink] = useState('');
  const [dueDate, setDueDate] = useState('');

  const loadAssessments = async () => {
    const mentorId = user?.mentorId;
    if (!mentorId) return;
    try {
      setLoading(true);
      const res = await assessmentAPI.getAssessments({ mentorId });
      if (res.data?.success) {
        setAssessments(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, [user]);

  const handlePostAssessment = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!title.trim() || !testLink.trim()) {
      setError('Title and Test Link are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        mentorId: user?.mentorId,
        title: title.trim(),
        description: description.trim(),
        targetDept: targetDept.trim(),
        testLink: testLink.trim(),
        dueDate: dueDate || null,
      };

      const res = await assessmentAPI.createAssessment(payload);
      if (res.data?.success) {
        setSuccess('Assessment posted successfully and assigned to students!');
        setTitle('');
        setDescription('');
        setTestLink('');
        setDueDate('');
        loadAssessments();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post assessment.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      const res = await assessmentAPI.deleteAssessment(id);
      if (res.data?.success) {
        setSuccess('Assessment deleted successfully.');
        loadAssessments();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete assessment.');
    } finally {
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-[#0b1940]">Assessment Management</h1>
          </div>
          <p className="text-xs text-slate-500">
            Create, schedule, and assign technical placement assessments for your department students at ABC College.
          </p>
        </div>

        <div className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
          Total Active Assessments: <span className="font-bold text-[#0b1940]">{assessments.length}</span>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Post Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Post New Assessment</h2>
            <p className="text-xs text-slate-500">Assign tests via HackerRank, Google Form, or coding platforms</p>
          </div>

          <form onSubmit={handlePostAssessment} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Assessment Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Data Structures & Algorithms Tier-1 Mock"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Description / Topics Covered
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Dynamic Programming, Graph Traversal, Binary Search Trees. 3 coding questions + 15 MCQs."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Department / Year <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40"
                >
                  <option value="CSE">CSE (All Batches)</option>
                  <option value="IT">IT (All Batches)</option>
                  <option value="ECE">ECE (All Batches)</option>
                  <option value="EEE">EEE (All Batches)</option>
                  <option value="All Departments">All Departments</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Due Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Assessment / Test Link (HackerRank, GForm, etc.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                value={testLink}
                onChange={(e) => setTestLink(e.target.value)}
                required
                placeholder="https://hackerrank.com/tests/... or https://forms.gle/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-[#0b1940] hover:bg-[#1a5cff] text-white font-bold transition-all shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{submitting ? 'Publishing Assessment...' : 'Publish Assessment'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Posted Assessments List (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Your Posted Assessments</h2>
              <p className="text-xs text-slate-500">Live assessments displayed in student dashboards</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1a5cff] border border-blue-200">
              {assessments.length} Published
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading assessments...</div>
          ) : assessments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <ClipboardList className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No assessments posted yet. Use the form on the left to assign a test to your students.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map((a) => (
                <div
                  key={a.assessmentId}
                  className="p-4 rounded-xl border border-slate-200 hover:border-[#1a5cff]/40 bg-slate-50/50 hover:bg-white transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{a.title}</h3>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{a.description || 'No description provided.'}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                      {a.targetDept || 'All Depts'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{a.completedCount || 0} completed</span>
                      </span>
                      {a.dueDate && (
                        <span className="flex items-center space-x-1 text-amber-700">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Due: {a.dueDate}</span>
                        </span>
                      )}
                      <span>Posted: {a.createdAt ? a.createdAt.substring(0, 10) : 'Active'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={a.testLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1a5cff] font-semibold text-xs transition-all flex items-center space-x-1 border border-blue-200"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDelete(a.assessmentId)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete Assessment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
