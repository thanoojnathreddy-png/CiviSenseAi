import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AnalyticalInsight } from '../../types';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldAlert,
  Compass,
  CheckCircle2,
  Info
} from 'lucide-react';

export const InsightsView: React.FC = () => {
  const { insights, selectedCountry, setAuthoritySubTab, setSelectedDistrict } = useApp();

  const [selectedType, setSelectedType] = useState<string>('All');

  const filteredInsights = insights.filter((item) => {
    if (selectedCountry && selectedCountry !== 'All' && item.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;
    if (selectedType !== 'All' && item.insight_type !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              Analytical Intelligence
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Data-Backed Public Decision Support
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Analytical Civic Insights & Emerging Trends
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Synthesizing relationships across citizen requests, demographic scale, and infrastructure deficits to surface macro planning priorities.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium self-start md:self-auto flex-wrap">
          {['All', 'Emerging Need', 'Infrastructure Gap', 'Coverage Gap', 'Emerging Trend'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded transition-all ${
                selectedType === t ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'All' ? 'All Insights' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Feed */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => {
          let badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
          let icon = <TrendingUp className="w-3.5 h-3.5 text-blue-600" />;
          if (insight.insight_type === 'Coverage Gap') {
            badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
            icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
          } else if (insight.insight_type === 'Infrastructure Gap') {
            badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
            icon = <Layers className="w-3.5 h-3.5 text-amber-600" />;
          }

          return (
            <div
              key={insight.insight_id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-blue-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${badgeColor}`}>
                    {icon}
                    <span>{insight.insight_type}</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{insight.region}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">ID: {insight.insight_id}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{insight.title}</h3>
                <p className="text-xs text-slate-700 font-normal leading-relaxed mt-1.5">
                  {insight.description}
                </p>
              </div>

              {/* Data Summary & Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                    Supporting Metric Evidence
                  </span>
                  <span className="font-mono font-medium text-slate-800 leading-snug">
                    {insight.metrics_summary}
                  </span>
                </div>

                <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100">
                  <span className="text-[10px] text-blue-900 uppercase font-semibold block mb-1">
                    Suggested Public Administration Action
                  </span>
                  <span className="text-slate-800 font-medium leading-snug">
                    {insight.suggested_attention}
                  </span>
                </div>
              </div>

              {/* Action Jump */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  Sector: <span className="font-semibold text-slate-800">{insight.category}</span>
                </span>
                <button
                  onClick={() => {
                    setAuthoritySubTab('map');
                  }}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold"
                >
                  <span>Examine on Demand Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
