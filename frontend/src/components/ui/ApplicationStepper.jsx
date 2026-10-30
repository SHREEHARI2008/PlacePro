import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export default function ApplicationStepper({ currentStatus = 'APPLIED', remarks = '' }) {
  const norm = (currentStatus || 'APPLIED').toUpperCase();

  const steps = [
    { key: 'APPLIED', label: 'Application Submitted', sub: 'Resume & Profile Received' },
    { key: 'SHORTLISTED', label: 'Shortlisted', sub: 'Passed Eligibility Criteria' },
    { key: 'UNDER_REVIEW', label: 'Under Review / Technical Round', sub: 'Evaluated by Recruiter' },
    { key: 'OFFERED', label: 'Offered / Placed', sub: 'Final Selection Confirmed' },
  ];

  const getStepIndex = (statusStr) => {
    if (statusStr === 'REJECTED') return -1;
    if (statusStr === 'SELECTED' || statusStr === 'OFFERED') return 3;
    if (statusStr === 'TECHNICAL_ROUND' || statusStr === 'HR_ROUND' || statusStr === 'UNDER_REVIEW') return 2;
    if (statusStr === 'SHORTLISTED') return 1;
    return 0; // APPLIED or default
  };

  const activeIdx = getStepIndex(norm);
  const isRejected = norm === 'REJECTED';

  return (
    <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
          Application Hiring Pipeline Stepper
        </h4>
        <span className="text-[11px] text-slate-500 font-mono">
          Status: <strong className={isRejected ? 'text-[#991b1b]' : 'text-[#0f172a]'}>{norm}</strong>
        </span>
      </div>

      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 py-2">
        {/* Connector line for desktop */}
        <div className="hidden md:block absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0">
          <div
            className={`h-full transition-all duration-300 ${isRejected ? 'bg-[#991b1b]' : 'bg-[#0f172a]'}`}
            style={{
              width: isRejected
                ? '100%'
                : `${Math.min(100, (activeIdx / (steps.length - 1)) * 100)}%`,
            }}
          />
        </div>

        {steps.map((step, idx) => {
          const isComplete = !isRejected && idx <= activeIdx;
          const isCurrent = !isRejected && idx === activeIdx;

          return (
            <div
              key={step.key}
              className="relative z-10 flex md:flex-col items-center space-x-3 md:space-x-0 space-y-0 md:space-y-2 text-left md:text-center flex-1"
            >
              {/* Indicator Circle */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                  isRejected && idx === activeIdx
                    ? 'bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]'
                    : isComplete
                    ? 'bg-[#0f172a] text-white font-bold'
                    : isCurrent
                    ? 'bg-[#2563eb] text-white font-bold ring-2 ring-blue-200'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : isCurrent ? (
                  <Clock className="w-5 h-5 text-white" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div>
                <p className={`text-xs font-bold ${isComplete || isCurrent ? 'text-[#0f172a]' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-500 max-w-[130px] leading-tight">{step.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {remarks && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <span className="font-bold text-[#0f172a]">Placement Cell Notes:</span> {remarks}
        </div>
      )}
    </div>
  );
}
