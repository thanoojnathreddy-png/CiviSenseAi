import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { InfrastructureIndex, AIPriorityRecommendation } from '../../types';
import { PriorityBadge } from '../common/Badge';
import { BarChart3, AlertCircle } from 'lucide-react';

interface GapAnalysisProps {
  infrastructure: InfrastructureIndex[];
  recommendations: AIPriorityRecommendation[];
}

export const GapAnalysis: React.FC<GapAnalysisProps> = ({
  infrastructure,
  recommendations
}) => {
  const [metricMode, setMetricMode] = useState<'index_vs_demand' | 'critical_deficits'>('index_vs_demand');

  // Format data for chart
  const chartData = infrastructure.map((infra) => {
    const recsForDist = recommendations.filter((r) => r.district.toLowerCase() === infra.district.toLowerCase());
    const totalRequests = recsForDist.reduce((acc, r) => acc + r.citizen_requests_count, 0);
    const avgScore = recsForDist.length > 0 ? recsForDist[0].priority_score : 50;

    return {
      district: infra.district,
      'Road Index (0-100)': infra.road_index,
      'Water Index (0-100)': infra.water_index,
      'Health Index (0-100)': infra.healthcare_index,
      'Infra Deficit (100 - Avg)': Math.round(100 - ((infra.road_index + infra.water_index + infra.healthcare_index) / 3)),
      'Citizen Demand Index': Math.min(100, Math.round(totalRequests * 2.6 + 15)),
      priorityScore: avgScore
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Infrastructure Gap vs. Citizen Demand Matrix
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Cross-comparing official infrastructure benchmarks against verified citizen demand concentration
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setMetricMode('index_vs_demand')}
            className={`px-2.5 py-1 rounded transition-all ${
              metricMode === 'index_vs_demand' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Demand vs Deficit
          </button>
          <button
            onClick={() => setMetricMode('critical_deficits')}
            className={`px-2.5 py-1 rounded transition-all ${
              metricMode === 'critical_deficits' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sector Indices (Road/Water/Health)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metricMode === 'index_vs_demand' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '12px',
                  border: 'none'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="Citizen Demand Index" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Infra Deficit (100 - Avg)" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '12px',
                  border: 'none'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="Road Index (0-100)" fill="#64748B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Water Index (0-100)" fill="#0284C7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Health Index (0-100)" fill="#0D9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Insight Highlight Footer */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="text-slate-700 leading-relaxed text-[11px]">
          <strong>AI Gap Correlation:</strong> Districts like <span className="font-semibold text-slate-900">Warangal (Road Deficit: 69%)</span> and <span className="font-semibold text-slate-900">Adilabad & Yavatmal (Water Deficit: 74%)</span> exhibit severe mismatch where citizen demand sharply exceeds official baseline capacity.
        </span>
      </div>
    </div>
  );
};
