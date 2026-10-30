import React, { useState } from 'react';
import { CheckCircle2, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

export default function EligibilityBadge({ isEligible, reasons = [], compact = false }) {
  const [open, setOpen] = useState(false);

  const isFailedReason = (r) => {
    const l = r.toLowerCase();
    return (
      l.includes('shortfall') ||
      l.includes('ineligible') ||
      l.includes('exceed') ||
      l.includes('below') ||
      l.includes('not eligible') ||
      l.includes('not in') ||
      l.includes('required:') ||
      l.includes('minimum cgpa') ||
      l.includes('active backlogs')
    );
  };

  const failedReasons = reasons.filter(isFailedReason);
  const displayReasons = failedReasons.length > 0 ? failedReasons : reasons;

  if (compact) {
    return isEligible ? (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Eligible</span>
      </span>
    ) : (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]">
        <XCircle className="w-3.5 h-3.5" />
        <span>Not Eligible</span>
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
          isEligible
            ? 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0] hover:bg-[#bbf7d0]'
            : 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca] hover:bg-[#fecaca]'
        }`}
        title={isEligible ? 'All eligibility criteria met' : 'Click to see unmet eligibility criteria'}
      >
        {isEligible ? <CheckCircle2 className="w-4 h-4 text-[#15803d]" /> : <XCircle className="w-4 h-4 text-[#991b1b]" />}
        <span>
          {isEligible
            ? 'Eligible to Apply'
            : displayReasons.length > 0
            ? `Not Eligible (${displayReasons.length} Unmet)`
            : 'Criteria Not Met'}
        </span>
        {displayReasons.length > 0 && (
          <span className="ml-1 opacity-75">
            {open ? <ChevronUp className="w-3.5 h-3.5 inline" /> : <ChevronDown className="w-3.5 h-3.5 inline" />}
          </span>
        )}
      </button>

      {open && displayReasons.length > 0 && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-80 p-3.5 bg-white rounded-xl border border-slate-200 shadow-xl z-40 text-left text-xs animate-in fade-in duration-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <div className="flex items-center space-x-1.5 text-[#0f172a] font-bold">
              <Info className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>{isEligible ? 'Eligibility Verification' : 'Unmet Criteria Breakdown'}</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {isEligible ? 'Verified' : 'Action Required'}
            </span>
          </div>
          <ul className="space-y-2 text-slate-700">
            {displayReasons.map((r, i) => {
              const failed = isFailedReason(r);
              return (
                <li key={i} className="flex items-start space-x-2 text-[11px] leading-relaxed">
                  {failed ? (
                    <XCircle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  )}
                  <span className={failed ? 'font-medium text-rose-900' : 'text-slate-700'}>{r}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
