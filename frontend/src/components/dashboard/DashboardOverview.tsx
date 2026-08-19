import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { HotspotMap } from './HotspotMap';
import { GapAnalysis } from './GapAnalysis';
import { TrendCharts } from './TrendCharts';
import { RecommendationsList } from './RecommendationsList';
import { RecommendationModal } from './RecommendationModal';
import {
  Layers,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Building2,
  Globe2,
  Compass,
  FileCheck2
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    stats,
    hotspots,
    recommendations,
    infrastructure,
    selectedCountry,
    selectedRecModal,
    setSelectedRecModal,
    refreshData,
    isLoading,
    setAuthoritySubTab
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');

  const filteredRecs = recommendations.filter((r) => {
    if (selectedCategory !== 'All' && r.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (selectedSeverity === 'Critical' && r.priority_level !== 'CRITICAL') return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Executive Header & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              Executive Briefing
            </span>
            <span className="text-xs text-slate-500 font-medium">
              National Infrastructure & Civic Intelligence Matrix
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Public Authority Intelligence Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-analyzing multilingual citizen demand across {selectedCountry === 'All' ? 'all monitored regions' : selectedCountry} to support evidence-based public infrastructure planning.
          </p>
        </div>

        {/* Global Action & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-800 text-xs font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Transportation">Transportation & Roads</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Healthcare">Healthcare Facilities</option>
              <option value="Education">Education & Schools</option>
              <option value="Waste Management">Waste & Drainage</option>
              <option value="Power & Energy">Power & Energy</option>
            </select>
          </div>

          <button
            onClick={() => refreshData()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top KPI Cards Row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Citizen Requests"
            value={stats.total_requests.toLocaleString()}
            subtitle={`${stats.voice_requests_count.toLocaleString()} Voice • ${stats.text_requests_count.toLocaleString()} Text`}
            trend={{ value: '+18% velocity', isPositive: true }}
            icon={<Users className="w-4 h-4 text-blue-600" />}
            variant="highlight"
          />

          <StatCard
            title="High-Priority Needs"
            value={stats.high_priority_needs_count}
            subtitle="Districts with critical demand-gap overlap"
            trend={{ value: 'Urgent attention', isPositive: false }}
            icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
            variant="critical"
          />

          <StatCard
            title="Infrastructure Gaps"
            value={stats.critical_infra_gaps_count}
            subtitle="Sectors scoring < 40/100 capacity index"
            icon={<Layers className="w-4 h-4 text-amber-600" />}
            variant="default"
          />

          <StatCard
            title="Areas Under Review"
            value={stats.areas_under_review_count}
            subtitle="Public interventions in planning"
            trend={{ value: 'Decision support ready', isPositive: true }}
            icon={<FileCheck2 className="w-4 h-4 text-emerald-600" />}
            variant="default"
          />
        </div>
      )}

      {/* Section 1: Demand Hotspot Map */}
      <HotspotMap hotspots={hotspots} />

      {/* Section 2: Infrastructure Gap Matrix */}
      <GapAnalysis infrastructure={infrastructure} recommendations={recommendations} />

      {/* Section 3: Ingestion Trends & Category/Language Breakdown */}
      <TrendCharts stats={stats} />

      {/* Section 4: Ranked AI Priority Recommendations */}
      <RecommendationsList recommendations={filteredRecs} />

      {/* Recommendation Deep-Dive Detail Modal */}
      {selectedRecModal && (
        <RecommendationModal
          rec={selectedRecModal}
          onClose={() => setSelectedRecModal(null)}
        />
      )}
    </div>
  );
};
