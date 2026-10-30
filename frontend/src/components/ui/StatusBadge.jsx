import React from 'react';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Award,
  XCircle,
  FileSearch,
} from 'lucide-react';

export default function StatusBadge({ status, className = '' }) {
  const normStatus = (status || 'APPLIED').toUpperCase();

  let config = {
    label: 'Applied',
    bg: 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]',
    icon: Clock,
  };

  if (normStatus === 'APPLIED' || normStatus === 'PENDING') {
    config = {
      label: 'Applied',
      bg: 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]',
      icon: Clock,
    };
  } else if (normStatus === 'SHORTLISTED') {
    config = {
      label: 'Shortlisted',
      bg: 'bg-[#dbeafe] text-[#1e40af] border-[#bfdbfe]',
      icon: UserCheck,
    };
  } else if (
    normStatus === 'UNDER REVIEW' ||
    normStatus === 'UNDER_REVIEW' ||
    normStatus === 'TECHNICAL_ROUND' ||
    normStatus === 'HR_ROUND'
  ) {
    config = {
      label: normStatus === 'TECHNICAL_ROUND' ? 'Technical Round' : normStatus === 'HR_ROUND' ? 'HR Round' : 'Under Review',
      bg: 'bg-[#f3e8ff] text-[#6b21a8] border-[#e9d5ff]',
      icon: FileSearch,
    };
  } else if (normStatus === 'OFFERED' || normStatus === 'SELECTED') {
    config = {
      label: 'Offered',
      bg: 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]',
      icon: Award,
    };
  } else if (normStatus === 'REJECTED') {
    config = {
      label: 'Rejected',
      bg: 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]',
      icon: XCircle,
    };
  }

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all ${config.bg} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
