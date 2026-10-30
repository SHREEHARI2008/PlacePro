import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function LeetCodeDonut({ stats, easy, medium, hard, total }) {
  const eVal = Number(stats?.easySolved !== undefined ? stats.easySolved : (easy ?? 0));
  const mVal = Number(stats?.mediumSolved !== undefined ? stats.mediumSolved : (medium ?? 0));
  const hVal = Number(stats?.hardSolved !== undefined ? stats.hardSolved : (hard ?? 0));
  const tVal = Number(stats?.totalSolved !== undefined ? stats.totalSolved : (total ?? (eVal + mVal + hVal)));

  const data = [
    { name: 'Easy', value: eVal, color: '#16a34a' },
    { name: 'Medium', value: mVal, color: '#d97706' },
    { name: 'Hard', value: hVal, color: '#dc2626' },
  ].filter(d => d.value > 0);

  const totalCalculated = tVal || (eVal + mVal + hVal);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-md">
                      <span className="font-semibold" style={{ color: payload[0].payload.color }}>
                        {payload[0].name}:
                      </span>{' '}
                      <span className="text-[#0f172a] font-bold">{payload[0].value}</span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data.length > 0 ? data : [{ name: 'None', value: 1, color: '#e2e8f0' }]}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={78}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold tracking-tight text-[#0f172a]">{totalCalculated}</span>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Solved</span>
        </div>
      </div>

      {/* Breakdown Legend */}
      <div className="grid grid-cols-3 gap-2.5 w-full mt-3">
        <div className="p-2.5 rounded-lg bg-[#dcfce7] border border-[#bbf7d0] text-center">
          <span className="text-[10px] font-bold text-[#15803d] block uppercase">Easy</span>
          <span className="text-base font-bold text-[#15803d]">{eVal}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#fef3c7] border border-[#fde68a] text-center">
          <span className="text-[10px] font-bold text-[#b45309] block uppercase">Medium</span>
          <span className="text-base font-bold text-[#b45309]">{mVal}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#fee2e2] border border-[#fecaca] text-center">
          <span className="text-[10px] font-bold text-[#991b1b] block uppercase">Hard</span>
          <span className="text-base font-bold text-[#991b1b]">{hVal}</span>
        </div>
      </div>
    </div>
  );
}
