import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ExecutiveStats } from '../../types';
import { TrendingUp, PieChart as PieIcon, Globe2, AlertOctagon } from 'lucide-react';

interface TrendChartsProps {
  stats: ExecutiveStats | null;
}

export const TrendCharts: React.FC<TrendChartsProps> = ({ stats }) => {
  if (!stats) return null;

  const trendData = stats.trend_over_time || [
    { period: 'Week 1', requests: 28, resolved: 8 },
    { period: 'Week 2', requests: 42, resolved: 14 },
    { period: 'Week 3', requests: 56, resolved: 22 },
    { period: 'Week 4', requests: 74, resolved: 31 }
  ];

  // Category Distribution format
  const catEntries = Object.entries(stats.category_distribution || {}).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / stats.total_requests) * 100)
  }));

  // Language Breakdown Colors
  const langColors: Record<string, string> = {
    Telugu: '#2563EB',
    Hindi: '#0D9488',
    English: '#64748B',
    Portuguese: '#D97706',
    Tamil: '#7C3AED'
  };

  const langData = Object.entries(stats.language_distribution || {}).map(([name, value]) => ({
    name,
    value,
    color: langColors[name] || '#94A3B8'
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Temporal Trend Area Chart (6 cols) */}
      <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Citizen Request Ingestion Velocity
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-medium">
              4-Week Trend
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Weekly volume of multilingual citizen submissions vs. prioritized project actions
          </p>
        </div>

        <div className="h-52 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '12px',
                  border: 'none'
                }}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#2563EB"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRequests)"
                name="Total Submissions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution (3 cols) */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <PieIcon className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Category Breakdown
          </h3>
        </div>

        <div className="space-y-3">
          {catEntries.map((cat) => (
            <div key={cat.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-700 truncate">{cat.name}</span>
                <span className="font-mono text-slate-900 font-bold">{cat.value} ({cat.percentage}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multilingual Intake Proportions (3 cols) */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Globe2 className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Multilingual Intake
          </h3>
        </div>

        <div className="space-y-3">
          {langData.map((l) => (
            <div key={l.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="font-semibold text-slate-800">{l.name}</span>
              </div>
              <span className="font-mono text-slate-700 font-bold">
                {l.value} requests
              </span>
            </div>
          ))}

          <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900">
            <span className="font-bold">DPG Extensibility:</span> Native support for Telugu, Hindi, English, Portuguese & extensible to Russian/Mandarin.
          </div>
        </div>
      </div>
    </div>
  );
};
