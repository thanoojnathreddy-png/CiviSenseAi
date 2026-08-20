import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommunityNeed } from '../../types';
import { PriorityBadge, CategoryBadge } from '../common/Badge';
import {
  Search,
  Filter,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowRight,
  Layers,
  Building,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Quote,
  Database,
  XCircle
} from 'lucide-react';

export const CommunityNeedsView: React.FC = () => {
  const {
    filteredCommunityNeeds,
    setSelectedRecModal,
    recommendations,
    setSelectedDistrict,
    setAuthoritySubTab,
    selectedCategory,
    setSelectedCategory,
    selectedPriorityFilter,
    setSelectedPriorityFilter,
    globalSearchQuery,
    setGlobalSearchQuery,
    hasActiveFilters,
    resetAllFilters
  } = useApp();

  const [expandedNeedId, setExpandedNeedId] = useState<string | null>(null);

  const toggleExpand = (needId: string) => {
    setExpandedNeedId((prev) => (prev === needId ? null : needId));
  };

  const handleOpenRec = (district: string) => {
    const matched = recommendations.find((r) => r.district.toLowerCase() === district.toLowerCase());
    if (matched) {
      setSelectedRecModal(matched);
    }
  };

  const handleInspectSignals = (district: string) => {
    setSelectedDistrict(district);
    setAuthoritySubTab('explorer');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              Semantic Clustering
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Community-Level Demand Aggregation
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Aggregated Community Development Needs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual citizen feedback is semantically grouped into broader infrastructure demands to identify true community priorities.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-500 block">Active Demand Clusters</span>
          <span className="text-xl font-extrabold font-mono text-slate-900">{filteredCommunityNeeds.length} Tracked Needs</span>
        </div>
      </div>

      {/* Filter Controls Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search need, issue keyword, or district..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="All">All Sectors</option>
              <option value="Transportation">Transportation & Roads</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Healthcare">Healthcare Facilities</option>
              <option value="Education">Education & Schools</option>
              <option value="Waste Management">Waste & Drainage</option>
              <option value="Power & Energy">Power & Energy</option>
            </select>
          </div>

          {/* Priority Level Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="All">All Priority Levels</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                title="Reset Filters"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Community Needs List with Expandable Semantic Clusters */}
      <div className="space-y-3">
        {filteredCommunityNeeds.map((need) => {
          const isExpanded = expandedNeedId === need.need_id;

          return (
            <div
              key={need.need_id}
              className={`bg-white rounded-xl border transition-all overflow-hidden ${
                isExpanded ? 'border-blue-400 shadow-md ring-1 ring-blue-200' : 'border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              {/* Need Card Header Row */}
              <div
                onClick={() => toggleExpand(need.need_id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {need.need_id}
                    </span>
                    <CategoryBadge category={need.category} />
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      need.demand_trend === 'Increasing' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      <TrendingUp className="w-3 h-3" />
                      <span>{need.demand_trend}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{need.title}</h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span>{need.district}, {need.state} ({need.country})</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {need.citizen_requests_count.toLocaleString()} verified requests
                    </span>
                    <span>•</span>
                    <span>~{need.affected_population_estimate.toLocaleString()} affected residents</span>
                  </div>
                </div>

                {/* Score & Expand Indicator */}
                <div className="flex items-center gap-4 self-end md:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Infra Condition</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {need.infrastructure_condition} ({need.infrastructure_index_score.toFixed(0)}/100)
                    </span>
                  </div>

                  <PriorityBadge level={need.priority_level} score={need.priority_score} size="md" />

                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expandable Semantic Grouping Inspector */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/70 p-5 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Semantic Clustering Evidence & Citizen Signals
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {need.citizen_requests_count.toLocaleString()} citizen voice & text inputs aggregated
                    </span>
                  </div>

                  {/* Grouped Citizen Request Samples */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {need.semantic_cluster_samples && need.semantic_cluster_samples.length > 0 ? (
                      need.semantic_cluster_samples.map((sample, sIdx) => (
                        <div key={sIdx} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-2 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-100 pb-1">
                            <span className="font-semibold text-slate-700">{sample.locality}</span>
                            <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                              {sample.language}
                            </span>
                          </div>

                          <div className="italic text-slate-800 text-[11px] leading-relaxed">
                            "{sample.original_quote}"
                          </div>

                          <div className="text-[10px] text-slate-500 font-medium">
                            <span className="text-slate-400">Translated:</span> "{sample.translated_quote}"
                          </div>

                          <div className="text-[10px] text-blue-700 font-medium bg-blue-50/60 px-2 py-1 rounded">
                            {sample.semantic_match_reason}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-xs text-slate-500 bg-white p-4 rounded-lg border border-slate-200">
                        Citizen signals in this cluster have been clustered based on shared proximity to {need.district} and semantic infrastructure indicators.
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200">
                    <div className="text-xs text-slate-600">
                      Active public works matching this demand: <strong className="text-slate-900">{need.active_projects_count} projects</strong>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspectSignals(need.district);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Database className="w-3.5 h-3.5 text-slate-500" />
                        <span>Inspect Raw Signals</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRec(need.district);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                      >
                        <span>View Policy Recommendation</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
