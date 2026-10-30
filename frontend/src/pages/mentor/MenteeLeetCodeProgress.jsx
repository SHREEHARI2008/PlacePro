import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mentorAPI, leetcodeAPI } from '../../services/api';
import {
  TrendingUp,
  Flame,
  ExternalLink,
  Search,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export default function MenteeLeetCodeProgress() {
  const { user } = useAuth();
  const [mentees, setMentees] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [syncingId, setSyncingId] = useState(null);
  const [syncAllLoading, setSyncAllLoading] = useState(false);
  const [notification, setNotification] = useState('');

  const loadAll = async () => {
    try {
      setLoading(true);
      const mentorId = user?.mentorId;
      const [menteesRes, lbRes] = await Promise.all([
        mentorId ? mentorAPI.getMentees(mentorId) : Promise.resolve({ data: { success: true, data: [] } }),
        leetcodeAPI.getLeaderboard(),
      ]);
      if (menteesRes.data?.success) setMentees(menteesRes.data.data);
      if (lbRes.data?.success) setLeaderboard(lbRes.data.data);
    } catch (err) {
      console.error('Error fetching mentee leetcode stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [user]);

  const syncSingleMentee = async (student) => {
    try {
      setSyncingId(student.studentId);
      const handle = student.leetcodeUsername || student.name.toLowerCase().replace(' ', '_');
      const res = await leetcodeAPI.syncProfile(student.studentId, handle);
      if (res.data?.success) {
        setNotification(`Live LeetCode data synced for ${student.name} (@${handle})`);
        loadAll();
      }
    } catch (err) {
      setNotification(`Failed to sync LeetCode for ${student.name}`);
    } finally {
      setSyncingId(null);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const syncAllMentees = async () => {
    try {
      setSyncAllLoading(true);
      for (const m of mentees) {
        const handle = m.leetcodeUsername || m.name.toLowerCase().replace(' ', '_');
        await leetcodeAPI.syncProfile(m.studentId, handle);
      }
      setNotification(`Successfully refreshed real-time LeetCode stats for all ${mentees.length} mentees!`);
      loadAll();
    } catch (err) {
      setNotification('Completed batch sync with available data');
    } finally {
      setSyncAllLoading(false);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const filteredMentees = mentees.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-slate-100 text-[#0f172a]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-[#0f172a]">Mentee Real-Time LeetCode Analytics</h1>
          </div>
          <p className="text-xs text-slate-500">
            Monitor real-time problem difficulty breakdown, streaks, and product company readiness.
          </p>
        </div>

        <button
          onClick={syncAllMentees}
          disabled={syncAllLoading}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#0f172a] hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncAllLoading ? 'animate-spin' : ''}`} />
          <span>{syncAllLoading ? 'Refreshing Batch...' : 'Sync All Mentees Live'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-lg bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Comparative Cards Table */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mentee..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[#cbd5e1] text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#16a34a]"></span> <span>Easy</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#d97706] ml-2"></span> <span>Medium</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#dc2626] ml-2"></span> <span>Hard</span>
          </div>
        </div>

        {/* Detailed Mentee Cards */}
        <div className="space-y-3">
          {filteredMentees.map((m) => {
            const lc = m.leetCodeStats || {};
            const total = lc.totalSolved || 0;
            const easy = lc.easySolved || 0;
            const med = lc.mediumSolved || 0;
            const hard = lc.hardSolved || 0;
            const easyPct = total > 0 ? (easy / total) * 100 : 0;
            const medPct = total > 0 ? (med / total) * 100 : 0;
            const hardPct = total > 0 ? (hard / total) * 100 : 0;

            const isProductReady = total >= 300 && (med + hard) >= 150;

            return (
              <div
                key={m.studentId}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                {/* Student Info */}
                <div className="flex items-center space-x-3.5 min-w-[200px]">
                  <img
                    src={m.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={m.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-[#0f172a] flex items-center space-x-1.5">
                      <span>{m.name}</span>
                      <a
                        href={`https://leetcode.com/${m.leetcodeUsername || 'rahul_verma'}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-[#2563eb]"
                        title="Open on LeetCode"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{m.rollNumber} • @{m.leetcodeUsername || 'user'}</div>
                  </div>
                </div>

                {/* Progress Bar (Difficulty Split) */}
                <div className="w-full max-w-sm space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-[#0f172a]">
                      Total Solved: <span className="text-[#15803d]">{total}</span>
                    </span>
                    <span className="text-slate-500">
                      E:{easy} | M:{med} | H:{hard}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 flex overflow-hidden">
                    <div style={{ width: `${easyPct}%` }} className="bg-[#16a34a] h-full" title={`Easy: ${easy}`} />
                    <div style={{ width: `${medPct}%` }} className="bg-[#d97706] h-full" title={`Medium: ${med}`} />
                    <div style={{ width: `${hardPct}%` }} className="bg-[#dc2626] h-full" title={`Hard: ${hard}`} />
                  </div>
                </div>

                {/* Streak & Global Rank */}
                <div className="flex items-center space-x-4 shrink-0 text-slate-700">
                  <div className="flex items-center space-x-1 text-[#b45309] font-semibold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{lc.streakDays || 0}d streak</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Rank: #{lc.globalRanking?.toLocaleString() || 'N/A'}
                  </div>
                </div>

                {/* Action & Readiness Tag */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span
                    className={`px-3 py-1 rounded text-[10px] font-bold ${
                      isProductReady
                        ? 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]'
                        : total >= 150
                        ? 'bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe]'
                        : 'bg-[#fef3c7] text-[#b45309] border border-[#fde68a]'
                    }`}
                  >
                    {isProductReady ? 'Tier-1 Ready' : total >= 150 ? 'Intermediate' : 'Needs Practice'}
                  </span>

                  <button
                    onClick={() => syncSingleMentee(m)}
                    disabled={syncingId === m.studentId}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all"
                    title="Fetch latest LeetCode stats"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingId === m.studentId ? 'animate-spin text-[#15803d]' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
