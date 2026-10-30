import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function GpaTrendChart({ records = [] }) {
  const chartData = records.map((r) => ({
    semester: `Sem ${r.semester}`,
    gpa: r.gpa,
    backlogs: r.backlogs,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
        No semester records logged yet.
      </div>
    );
  }

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="semester" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 10]} stroke="#64748b" tick={{ fontSize: 11 }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-md text-xs">
                    <p className="font-bold text-[#0f172a]">{label}</p>
                    <p className="text-[#2563eb] font-semibold mt-0.5">
                      GPA: <span className="text-[#0f172a]">{payload[0].value.toFixed(2)}</span>
                    </p>
                    {payload[0].payload.backlogs > 0 && (
                      <p className="text-[#991b1b] text-[11px]">Backlogs: {payload[0].payload.backlogs}</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="gpa"
            stroke="#2563eb"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#gpaGradient)"
            dot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#0f172a' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
