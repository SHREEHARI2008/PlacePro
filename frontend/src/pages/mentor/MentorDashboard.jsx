import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mentorAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import {
  Users,
  Award,
  Code2,
  Building2,
  ArrowUpRight,
  PlusCircle,
  Shield,
  Edit3
} from 'lucide-react';

export default function MentorDashboard({ setActiveTab }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const mentorId = user?.mentorId;
      if (!mentorId) return;
      try {
        setLoading(true);
        const res = await mentorAPI.getDashboard(mentorId);
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching mentor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#0f172a] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading mentor workspace...</p>
        </div>
      </div>
    );
  }

  const mentor = data?.mentor || {};
  const mentees = data?.mentees || [];
  const recentDrives = data?.recentDrives || [];

  return (
    <div className="space-y-6">
      {/* Mentor Welcome Banner */}
      <div className="rounded-xl bg-[#0f172a] p-6 md:p-8 border border-slate-800 text-white shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Mentor &amp; Placement Supervisory Hub</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              Welcome, <span className="text-blue-300">{mentor.name || user?.name}</span>
            </h1>
            <p className="text-xs text-slate-300">
              {mentor.designation} • {mentor.department} • Cabin: <span className="text-white font-mono">{mentor.cabinLocation}</span>
            </p>
          </div>

          <button
            onClick={() => {
              if (setActiveTab) setActiveTab('post_drive');
              navigate('/mentor/post-drive');
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Placement Drive</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics (Avg LeetCode and Active Drives cards removed per requirements) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Assigned Mentees"
          value={data?.menteesCount || mentees.length || 0}
          subtext="Students under supervision"
          icon={Users}
          color="indigo"
          trend="100% active profiles"
        />
        <StatCard
          title="Batch Avg CGPA"
          value={data?.averageCgpa ? data.averageCgpa.toFixed(2) : '8.09'}
          subtext="Target benchmark: >7.50"
          icon={Award}
          color="emerald"
          trend="Healthy academic standing"
        />
      </div>

      {/* 2-Column: Mentees Overview + Recent Placement Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mentee Quick Cards */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#0f172a]" />
              <h3 className="text-sm font-bold text-[#0f172a]">Mentees Progress Summary</h3>
            </div>
            <button
              onClick={() => {
                if (setActiveTab) setActiveTab('mentees');
                navigate('/mentor/mentees');
              }}
              className="text-xs font-semibold text-[#2563eb] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>View All Mentees</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
            {mentees.map((item, idx) => {
              const s = item.student;
              const lc = s.leetCodeStats;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100/80 transition-all text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={s.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={s.name}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-[#0f172a]">{s.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {s.rollNumber} • CGPA: <span className="text-[#15803d] font-bold">{s.cgpa}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-[#0f172a] flex items-center space-x-1 justify-end">
                      <Code2 className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>{lc?.totalSolved || 0} Solved</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.isSelected
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : item.isShortlisted
                          ? 'bg-[#dbeafe] text-[#1e40af]'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.isSelected ? 'Placed 🎉' : item.isShortlisted ? 'Shortlisted' : `${item.applicationsCount} Applied`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 text-center">
            Click 'View All Mentees' to inspect full academic graphs & submit individual feedback.
          </div>
        </div>

        {/* Recent Drives Posted */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-[#0f172a]" />
              <h3 className="text-sm font-bold text-[#0f172a]">Active Placement Drives</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Shared Global
              </span>
            </div>
            <button
              onClick={() => {
                if (setActiveTab) setActiveTab('applications');
                navigate('/mentor/applications');
              }}
              className="text-xs font-semibold text-[#2563eb] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Manage Candidates</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
            {recentDrives.map((drive) => (
              <div
                key={drive.id}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={drive.logoUrl || 'https://img.icons8.com/color/48/building.png'}
                      alt={drive.companyName}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-[#0f172a]">{drive.companyName}</div>
                    <div className="text-slate-500 text-[11px]">{drive.jobRole}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-bold text-[#15803d]">{drive.packageLpa} LPA</div>
                    <div className="text-[10px] text-slate-500">{drive.applicantCount} Total Applicants</div>
                  </div>
                  <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                    <button
                      onClick={() => navigate(`/mentor/post-drive?driveId=${drive.id}`)}
                      className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-[#0f172a] transition-colors cursor-pointer"
                      title="Edit Shared Drive"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/mentor/applications?driveId=${drive.id}`)}
                      className="p-1.5 rounded-md hover:bg-slate-200 text-[#2563eb] transition-colors cursor-pointer"
                      title="Manage Mentees Applied"
                    >
                      <Users className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 text-center">
            {recentDrives.length} total company drives shared across all mentors and visible to all students.
          </div>
        </div>
      </div>
    </div>
  );
}
