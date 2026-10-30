import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { leetcodeAPI } from '../../services/api';
import LeetCodeDonut from '../../components/LeetCodeDonut';
import {
  Code2,
  RefreshCw,
  Trophy,
  CheckCircle2,
  ExternalLink,
  Target,
  Layers,
  Sparkles,
  Radio,
  Clock,
  Building2,
  Activity
} from 'lucide-react';

export default function StudentLeetCode() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [handle, setHandle] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const studentId = user?.studentId;
      if (!studentId) return;
      const [statsRes, lbRes] = await Promise.all([
        leetcodeAPI.getStats(studentId),
        leetcodeAPI.getLeaderboard(),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
        setHandle(statsRes.data.data?.username || user?.leetcodeUsername || '');
      }
      if (lbRes.data?.success) {
        setLeaderboard(lbRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching leetcode data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadData();
      // Auto-track LeetCode live on entering the page
      const studentId = user?.studentId;
      const targetHandle = user?.leetcodeUsername || 'rahul_verma';
      if (studentId && targetHandle) {
        try {
          setSyncing(true);
          const res = await leetcodeAPI.syncProfile(studentId, targetHandle);
          if (res.data?.success) {
            setStats(res.data.data);
            setHandle(res.data.data.username || targetHandle);
            const lbRes = await leetcodeAPI.getLeaderboard();
            if (lbRes.data?.success) setLeaderboard(lbRes.data.data);
          }
        } catch (e) {
          console.warn('Auto-sync on page enter failed', e);
        } finally {
          setSyncing(false);
        }
      }
    };
    init();
  }, [user]);

  const handleSync = async (e) => {
    if (e) e.preventDefault();
    const studentId = user?.studentId;
    const targetHandle = stats?.username || handle || user?.leetcodeUsername || 'rahul_verma';
    if (!studentId || !targetHandle) return;

    try {
      setSyncing(true);
      setSyncMsg('');
      const res = await leetcodeAPI.syncProfile(studentId, targetHandle.trim());
      if (res.data?.success) {
        setStats(res.data.data);
        setHandle(res.data.data.username || targetHandle.trim());
        setSyncMsg(`Successfully synced live LeetCode stats for @${targetHandle.trim()}!`);
        const lbRes = await leetcodeAPI.getLeaderboard();
        if (lbRes.data?.success) setLeaderboard(lbRes.data.data);
      }
    } catch (err) {
      setSyncMsg(err.response?.data?.error || 'Live sync failed');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(''), 5000);
    }
  };

  // Parse topic stats JSON
  let topicStats = {};
  try {
    if (stats?.topicStatsJson) {
      topicStats = JSON.parse(stats.topicStatsJson);
    }
  } catch (e) {
    topicStats = {
      Arrays: 95,
      Strings: 72,
      'Dynamic Programming': 45,
      Trees: 52,
      Graphs: 38,
      'Hash Table': 60,
    };
  }

  // Parse recent submissions
  let recentSubmissions = [];
  try {
    if (stats?.recentSubmissionsJson) {
      recentSubmissions = JSON.parse(stats.recentSubmissionsJson);
    }
  } catch (e) {
    recentSubmissions = [];
  }

  // Parse badges
  let badges = [];
  try {
    if (stats?.badgesJson) {
      badges = JSON.parse(stats.badgesJson);
    }
  } catch (e) {
    badges = [];
  }

  const total = stats?.totalSolved || 0;
  const easy = stats?.easySolved || 0;
  const med = stats?.mediumSolved || 0;
  const hard = stats?.hardSolved || 0;

  // Platform question totals
  const qEasy = stats?.totalEasyQuestions || 960;
  const qMed = stats?.totalMediumQuestions || 2100;
  const qHard = stats?.totalHardQuestions || 970;
  const qTotal = stats?.totalQuestions || 4030;

  // Target Company Benchmark calculations
  const companyTargets = [
    {
      company: 'Google (Tier 1)',
      targetTotal: 400,
      targetMed: 180,
      targetHard: 40,
      score: Math.min(100, Math.round(((total / 400) * 0.4 + (med / 180) * 0.4 + (hard / 40) * 0.2) * 100)),
      status: total >= 400 && hard >= 35 ? 'Ready' : 'In Progress',
    },
    {
      company: 'Microsoft (Tier 1)',
      targetTotal: 300,
      targetMed: 140,
      targetHard: 25,
      score: Math.min(100, Math.round(((total / 300) * 0.4 + (med / 140) * 0.4 + (hard / 25) * 0.2) * 100)),
      status: total >= 300 ? 'Ready' : 'In Progress',
    },
    {
      company: 'Amazon SDE-1',
      targetTotal: 300,
      targetMed: 140,
      targetHard: 25,
      score: Math.min(100, Math.round(((total / 300) * 0.5 + (med / 140) * 0.5) * 100)),
      status: total >= 300 ? 'Ready' : 'In Progress',
    },
    {
      company: 'Zoho / Startups',
      targetTotal: 200,
      targetMed: 90,
      targetHard: 10,
      score: Math.min(100, Math.round(((total / 200) * 0.6 + (med / 90) * 0.4) * 100)),
      status: total >= 200 ? 'Ready' : 'In Progress',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Header & Sync Control Banner (Search box removed) */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-[#0f172a]">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-[#0f172a]">Live LeetCode Real-Time Tracker</h1>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]">
                    <Radio className="w-3 h-3 text-[#15803d]" />
                    <span>Live Auto-Track</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Tracked automatically via official LeetCode GraphQL API on page access.
                </p>
              </div>
            </div>
          </div>

          {/* Connected Handle Status & Live Sync Action */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-400 mr-1.5 font-medium">Connected Handle:</span>
              <span className="font-bold text-[#0f172a] font-mono">@{stats?.username || handle || user?.leetcodeUsername || 'Not connected'}</span>
            </div>
            <button
              type="button"
              onClick={(e) => handleSync(e)}
              disabled={syncing}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#0f172a] hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition-all shrink-0 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {syncMsg && (
        <div className="p-3.5 rounded-lg bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0" />
          <span>{syncMsg}</span>
        </div>
      )}

      {/* 4 Distinct KPI Metrics with Maximum Streak */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Solved */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-[#0f172a] shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-500">Total Solved</p>
            <p className="text-2xl font-extrabold text-[#0f172a]">{total}</p>
            <span className="text-[10px] text-slate-500 font-semibold">of {qTotal} on Platform</span>
          </div>
        </div>

        {/* Metric 2: Maximum Streak */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 shrink-0">
            <Trophy className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-500">Maximum Streak</p>
            <p className="text-2xl font-extrabold text-purple-600">
              {stats?.maxStreak || (stats?.streakDays || 0)} Days
            </p>
            <span className="text-[10px] text-purple-700 font-semibold">Historical Best Record</span>
          </div>
        </div>

        {/* Metric 3: Acceptance Rate */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 shrink-0">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-500">Acceptance Rate</p>
            <p className="text-2xl font-extrabold text-[#0f172a]">
              {stats?.acceptanceRate ? stats.acceptanceRate.toFixed(1) : '0.0'}%
            </p>
            <span className="text-[10px] text-blue-600 font-semibold">Clean AC Rate</span>
          </div>
        </div>

        {/* Metric 4: Global Ranking */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0">
            <Trophy className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-500">Global Ranking</p>
            <p className="text-2xl font-extrabold text-[#0f172a]">
              {stats?.globalRanking ? `#${stats.globalRanking.toLocaleString()}` : 'N/A'}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">Worldwide Rank</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Breakdown & Progress vs Total + Company Benchmark Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Problem Donut & Difficulty Bars */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-[#0f172a]">Difficulty Distribution</h3>
            <a
              href={`https://leetcode.com/${stats?.username || 'rahul_verma'}/`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#2563eb] hover:underline flex items-center space-x-1"
            >
              <span>{stats?.username}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <LeetCodeDonut easy={easy} medium={med} hard={hard} total={total} />

          {/* Difficulty Progress Bars with Platform Totals */}
          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-[#15803d]">Easy</span>
                <span className="text-slate-500 font-mono">
                  {easy} / <span className="text-slate-400">{qEasy}</span> ({Math.round((easy / qEasy) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#16a34a] rounded-full"
                  style={{ width: `${Math.min(100, (easy / qEasy) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-[#b45309]">Medium</span>
                <span className="text-slate-500 font-mono">
                  {med} / <span className="text-slate-400">{qMed}</span> ({Math.round((med / qMed) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#d97706] rounded-full"
                  style={{ width: `${Math.min(100, (med / qMed) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-[#991b1b]">Hard</span>
                <span className="text-slate-500 font-mono">
                  {hard} / <span className="text-slate-400">{qHard}</span> ({Math.round((hard / qHard) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#dc2626] rounded-full"
                  style={{ width: `${Math.min(100, (hard / qHard) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Company Benchmark Readiness Meters */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#0f172a]" />
                <h3 className="text-sm font-bold text-[#0f172a]">Company Readiness Index</h3>
              </div>
              <span className="text-[11px] text-slate-500">Target Metrics</span>
            </div>

            <div className="space-y-3.5">
              {companyTargets.map((ct, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0f172a]">{ct.company}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ct.score >= 80
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : ct.score >= 50
                          ? 'bg-[#dbeafe] text-[#1e40af]'
                          : 'bg-[#fef3c7] text-[#b45309]'
                      }`}
                    >
                      {ct.score}% Ready
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-[#0f172a] rounded-full"
                      style={{ width: `${ct.score}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>
                      Target: {ct.targetTotal}+ ({ct.targetMed}M, {ct.targetHard || 0}H)
                    </span>
                    <span className="text-[#0f172a] font-semibold">
                      Current: {total} ({med}M, {hard}H)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {badges.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 mb-2">Earned Badges</p>
              <div className="flex items-center space-x-2 flex-wrap">
                {badges.map((b, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#fef3c7] text-[#b45309] border border-[#fde68a] flex items-center space-x-1"
                  >
                    <Trophy className="w-3 h-3 text-[#b45309]" />
                    <span>{b.displayName || 'Badge'}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Peer Leaderboard & Live Ranking */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-[#b45309]" />
                <h3 className="text-sm font-bold text-[#0f172a]">Campus Batch Ranking</h3>
              </div>
              <span className="text-xs text-slate-500">{leaderboard.length} Students</span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {leaderboard.map((item, index) => {
                const isCurrent = user?.studentId && item.studentId === user.studentId;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                      isCurrent
                        ? 'bg-slate-100 border-slate-300 font-bold'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                          index === 0
                            ? 'bg-[#fef3c7] text-[#b45309]'
                            : index === 1
                            ? 'bg-slate-200 text-slate-700'
                            : index === 2
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <img
                        src={item.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={item.name}
                        className="w-7 h-7 rounded object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-[#0f172a] flex items-center space-x-1">
                          <span>{item.name}</span>
                          {isCurrent && <span className="text-[10px] text-[#2563eb] font-bold">(You)</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.rollNumber}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-[#15803d]">{item.totalSolved}</div>
                      <div className="text-[10px] text-slate-400">solved</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200 text-center text-xs text-[#2563eb] font-semibold">
            Ranks are updated automatically upon each live sync!
          </div>
        </div>
      </div>

      {/* Bottom Grid: Tag/Topic Mastery Breakdown & Recent Accepted Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic-Wise Solved Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#0f172a]" />
              <h3 className="text-sm font-bold text-[#0f172a]">Algorithmic Topic & Tag Distribution</h3>
            </div>
            <span className="text-xs text-slate-500">{Object.keys(topicStats).length} Topics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
            {Object.entries(topicStats).map(([topic, count], idx) => {
              const maxVal = 100;
              const pct = Math.min(100, Math.round((Number(count) / maxVal) * 100));
              return (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#0f172a] truncate">{topic}</span>
                    <span className="text-slate-600 font-mono">{count}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0f172a]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Accepted Submissions Live Feed */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#15803d]" />
                <h3 className="text-sm font-bold text-[#0f172a]">Recent Accepted Solutions</h3>
              </div>
              <span className="text-xs text-slate-500">Live Activity Feed</span>
            </div>

            {recentSubmissions.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {recentSubmissions.map((sub, i) => {
                  const dateStr = sub.timestamp
                    ? new Date(parseInt(sub.timestamp) * 1000).toLocaleDateString()
                    : 'Recently';

                  return (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-100 transition-all"
                    >
                      <div className="flex items-center space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0" />
                        <div>
                          <a
                            href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-[#0f172a] hover:text-[#2563eb] transition-colors flex items-center space-x-1"
                          >
                            <span>{sub.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                          <span className="text-[10px] text-slate-500 font-mono">Solved on {dateStr}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]">
                        Accepted
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <Code2 className="w-8 h-8 mx-auto text-slate-400" />
                <p>No recent public submissions found for this username.</p>
                <p className="text-[11px] text-slate-500">Click 'Fetch Live' with an active LeetCode username to load real-time solved problems.</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 text-center">
            Tracking live from LeetCode.com
          </div>
        </div>
      </div>
    </div>
  );
}
