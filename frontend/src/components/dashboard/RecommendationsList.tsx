import React, { useState } from 'react';
import { AIPriorityRecommendation } from '../../types';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, CategoryBadge } from '../common/Badge';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Building,
  CheckCircle2,
  Filter,
  DollarSign,
  FileCheck2,
  ChevronRight
} from 'lucide-react';

interface RecommendationsListProps {
  recommendations: AIPriorityRecommendation[];
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations }) => {
  const { setSelectedRecModal } = useApp();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              Decision Support
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Explainable Public Works Prioritization
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Prioritized Public Infrastructure Recommendations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent scoring cross-referencing citizen demand intensity, official infrastructure deficits, and active public projects.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-500 font-semibold bg-white px-2.5 py-1 rounded border border-slate-200 self-start sm:self-auto">
          {recommendations.length} Actionable Interventions
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-200">
        {recommendations.map((rec) => {
          return (
            <div
              key={rec.recommendation_id}
              onClick={() => setSelectedRecModal(rec)}
              className="p-5 hover:bg-slate-50/80 transition-all cursor-pointer space-y-3 group"
            >
              {/* Title Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {rec.recommendation_id}
                    </span>
                    <CategoryBadge category={rec.category} />
                    <span className="text-xs font-semibold text-slate-600">
                      {rec.district}, {rec.state} ({rec.country})
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {rec.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <PriorityBadge level={rec.priority_level} score={rec.priority_score} size="md" />
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Plain-Language AI Explanation */}
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">
                {rec.ai_reasoning}
              </p>

              {/* Factors Summary Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Citizen Signals</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {rec.citizen_requests_count.toLocaleString()} requests
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Affected Pop</span>
                  <span className="font-bold text-slate-800 font-mono">
                    ~{rec.affected_population_estimate.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Infra Score</span>
                  <span className="font-bold text-rose-600 font-mono">
                    {rec.infrastructure_index_score.toFixed(0)} / 100
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Suggested Outlay</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{rec.suggested_intervention.estimated_cost_inr_cr} Cr
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
