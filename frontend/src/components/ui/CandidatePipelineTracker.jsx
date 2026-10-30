import React from 'react';
import { User, Code2, Award, CheckCircle2, UserCheck, XCircle, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function CandidatePipelineTracker({
  applications = [],
  onUpdateStatus,
  updatingId,
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-[#0f172a]">Recruiter ATS Candidate Round Tracker</h3>
          <p className="text-xs text-slate-500">
            Interactive candidate pipeline with 1-click round advancement buttons.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
          Recruiter ATS View
        </span>
      </div>

      {/* Candidate Pipeline Cards */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto custom-table-scrollbar pr-1">
        {applications.map((app) => {
          const isSelected = app.status === 'SELECTED' || app.status === 'OFFERED';
          const isRejected = app.status === 'REJECTED';

          return (
            <div
              key={app.id}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs shadow-xs"
            >
              {/* Candidate Info */}
              <div className="space-y-1 min-w-[220px]">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#0f172a] text-sm">{app.studentName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {app.studentDepartment || 'CSE'}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] font-mono">
                  Roll: {app.studentRoll} • Company: <strong className="text-[#0f172a]">{app.companyName}</strong>
                </div>
                <div className="flex items-center space-x-3 pt-1 text-[11px]">
                  <span className="text-emerald-700 font-bold">CGPA: {app.studentCgpa || '8.50'}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700 font-semibold flex items-center space-x-1">
                    <Code2 className="w-3.5 h-3.5 text-[#2563eb]" />
                    <span>{app.studentLeetcodeTotalSolved || 0} Solved</span>
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                <StatusBadge status={app.status} />
              </div>

              {/* Quick Round Action Buttons */}
              <div className="flex items-center space-x-1.5 flex-wrap gap-1 shrink-0">
                <button
                  type="button"
                  disabled={updatingId === app.id || app.status === 'SHORTLISTED'}
                  onClick={() => onUpdateStatus && onUpdateStatus(app.id, 'SHORTLISTED', 'Shortlisted by Recruiter ATS')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-all disabled:opacity-40"
                >
                  Shortlist
                </button>

                <button
                  type="button"
                  disabled={updatingId === app.id || app.status === 'TECHNICAL_ROUND'}
                  onClick={() => onUpdateStatus && onUpdateStatus(app.id, 'TECHNICAL_ROUND', 'Advanced to Technical Interview')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-all disabled:opacity-40"
                >
                  Tech Round
                </button>

                <button
                  type="button"
                  disabled={updatingId === app.id || app.status === 'HR_ROUND'}
                  onClick={() => onUpdateStatus && onUpdateStatus(app.id, 'HR_ROUND', 'Advanced to HR Round')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-all disabled:opacity-40"
                >
                  HR Round
                </button>

                <button
                  type="button"
                  disabled={updatingId === app.id || isSelected}
                  onClick={() => onUpdateStatus && onUpdateStatus(app.id, 'SELECTED', 'Official Offer Extended!')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white text-[11px] font-bold transition-all disabled:opacity-40"
                >
                  Grant Offer
                </button>

                <button
                  type="button"
                  disabled={updatingId === app.id || isRejected}
                  onClick={() => onUpdateStatus && onUpdateStatus(app.id, 'REJECTED', 'Not selected in current drive')}
                  className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-semibold transition-all disabled:opacity-40"
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}

        {applications.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            No applicant records available in recruiter ATS pipeline.
          </div>
        )}
      </div>
    </div>
  );
}
