import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

export default function DriveManagementCard({ drive = {}, onSelectDrive }) {
  const skills = (drive.requiredSkills || 'Java, DSA, System Design').split(',').map((s) => s.trim());

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col justify-between space-y-4 shadow-xs hover:border-slate-300 transition-all duration-150">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
            <img
              src={drive.logoUrl || 'https://img.icons8.com/color/48/building.png'}
              alt={drive.companyName}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0f172a] tracking-tight">{drive.companyName}</h3>
            <div className="text-xs text-slate-500 font-medium">{drive.jobRole}</div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-[#15803d] tracking-tight">{drive.packageLpa} LPA</div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">CTC Package</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{drive.description}</p>

      {/* Threshold Metrics */}
      <div className="grid grid-cols-3 gap-2 text-center text-[11px] py-2 border-y border-slate-100">
        <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 block uppercase">Min CGPA</span>
          <span className="font-semibold text-[#0f172a]">{drive.minCgpa ? drive.minCgpa.toFixed(2) : '7.50'}</span>
        </div>
        <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 block uppercase">Applicants</span>
          <span className="font-semibold text-blue-700">{drive.applicantCount || 0} Candidates</span>
        </div>
        <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 block uppercase">Location</span>
          <span className="font-semibold text-[#0f172a] truncate block">{drive.jobLocation || 'Bengaluru'}</span>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 flex-wrap gap-1">
        <span className="text-[11px] font-semibold text-slate-500">Required Skills:</span>
        {skills.slice(0, 4).map((s, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-1 text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Drive Date: {drive.driveDate || '2026-10-15'}</span>
        </div>

        <button
          type="button"
          onClick={() => onSelectDrive && onSelectDrive(drive)}
          className="px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center space-x-1 shadow-xs"
        >
          <span>ATS Pipeline</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
