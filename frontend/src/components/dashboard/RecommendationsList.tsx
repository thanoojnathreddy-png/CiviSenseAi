import React, { useState } from 'react';
import { AIPriorityRecommendation } from '../../types';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, CategoryBadge } from '../common/Badge';
import { Sparkles, ArrowRight, CheckCircle2, FileText, AlertTriangle, Users, Building, ShieldAlert } from 'lucide-react';

interface RecommendationsListProps {
  recommendations: AIPriorityRecommendation[];
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations
}) => {
  const { setSelectedRecModal } = useApp();
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const filteredRecs = recommendations.filter((r) => {
    if (filterLevel !== 'All' && r.priority_level.toUpperCase() !== filterLevel.toUpperCase()) return false;
    if (filterCategory !== 'All' && r.category.toLowerCase() !== filterCategory.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header & Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              AI-Generated Infrastructure Priority Recommendations
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparently ranked development interventions combining citizen voice density, infrastructure deficit, demographic reach & project gaps
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Level Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
            {['All', 'CRITICAL', 'HIGH', 'MEDIUM'].map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-3 py-1 rounded transition-all ${
                  filterLevel === level
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {level === 'All' ? 'All Priorities' : level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {filteredRecs.map((rec, index) => {
          const isCritical = rec.priority_level === 'CRITICAL';
          
          return (
            <div
              key={rec.recommendation_id}
              className={`rounded-xl border transition-all p-5 hover:shadow-md ${
                isCritical
                  ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Block: Rank, Title, Category, Region */}
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    #{index + 1}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <PriorityBadge level={rec.priority_level} score={rec.priority_score} size="md" />
                      <CategoryBadge category={rec.category} />
                      <span className="text-xs font-medium text-slate-500">
                        {rec.district}, {rec.state} ({rec.country})
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-blue-600 cursor-pointer"
                      onClick={() => setSelectedRecModal(rec)}
                    >
                      {rec.title}
                    </h3>

                    {/* AI Plain-Language Reasoning Summary */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 pt-1 font-normal">
                      <span className="font-semibold text-slate-800">AI Rationale:</span> {rec.ai_reasoning}
                    </p>
                  </div>
                </div>

                {/* Center: Key Metric Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:w-96 text-xs shrink-0 bg-slate-50/90 p-3 rounded-lg border border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-medium block">Citizen Demand</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {rec.citizen_requests_count} Requests
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-medium block">Infra Index</span>
                    <span className={`font-mono font-bold text-sm ${rec.infrastructure_index_score < 40 ? 'text-rose-700' : 'text-slate-800'}`}>
                      {rec.infrastructure_index_score.toFixed(0)}/100
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-medium block">Affected Pop</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {rec.affected_population_estimate.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-medium block">Matching Works</span>
                    <span className={`font-mono font-bold text-sm ${rec.existing_matching_projects_count === 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {rec.existing_matching_projects_count} Active
                    </span>
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="flex items-center lg:flex-col justify-end gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedRecModal(rec)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all w-full sm:w-auto justify-center"
                  >
                    <span>Explainable AI Detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono text-center">
                    ID: {rec.recommendation_id}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
