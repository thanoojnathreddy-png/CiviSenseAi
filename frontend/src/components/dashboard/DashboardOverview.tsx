import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
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
  RefreshCw,
  FileCheck2,
  Search,
  XCircle,
  Clock
} from 'lucide-react';
import { TimePeriodFilter } from '../../types';

export const DashboardOverview: React.FC = () => {
  const {
    stats,
    filteredHotspots,
    filteredRecommendations,
    infrastructure,
    selectedCountry,
    selectedDistrict,
    setSelectedDistrict,
    selectedCategory,
    setSelectedCategory,
    selectedPriorityFilter,
    setSelectedPriorityFilter,
    selectedTimePeriod,
    setSelectedTimePeriod,
    globalSearchQuery,
    setGlobalSearchQuery,
    hasActiveFilters,
    resetAllFilters,
    filterByIndicator,
    selectedRecModal,
    setSelectedRecModal,
    refreshData,
    isLoading,
    demographics
  } = useApp();

  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Executive Header & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                {t('nav.brand')} AI
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t('dashboard.subtitle')}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {t('dashboard.title')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('dashboard.subtitle')} ({selectedCountry === 'All' ? t('nav.allBrics') : selectedCountry})
            </p>
          </div>

          {/* Action & Refresh */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{t('dashboard.resetFilters')}</span>
              </button>
            )}

            <button
              onClick={() => refreshData()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer active:scale-98"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{t('common.filter')}</span>
            </button>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder={t('needs.searchPlaceholder')}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* District Filter */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="All">{t('dashboard.allDistricts')}</option>
              {demographics.map((d) => (
                <option key={d.district} value={d.district}>
                  {d.district} ({d.state})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="All">{t('dashboard.allCategories')}</option>
              <option value="Transportation">Transportation & Roads</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Healthcare">Healthcare Facilities</option>
              <option value="Education">Education & Schools</option>
              <option value="Waste Management">Waste & Drainage</option>
              <option value="Power & Energy">Power & Energy</option>
            </select>
          </div>

          {/* Priority Level */}
          <div>
            <select
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="All">{t('dashboard.allPriorities')}</option>
              <option value="CRITICAL">{t('common.critical')}</option>
              <option value="HIGH">{t('common.high')}</option>
              <option value="MEDIUM">{t('common.medium')}</option>
            </select>
          </div>

          {/* Time Period Filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-300 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5 shrink-0" />
            <select
              value={selectedTimePeriod}
              onChange={(e) => setSelectedTimePeriod(e.target.value as TimePeriodFilter)}
              className="bg-transparent text-slate-900 text-xs font-medium focus:outline-hidden cursor-pointer w-full"
            >
              <option value="all">{t('dashboard.allTime')}</option>
              <option value="last_30_days">{t('dashboard.last30Days')}</option>
              <option value="last_90_days">{t('dashboard.last90Days')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Top KPI Cards Row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => filterByIndicator('total')}
            className="cursor-pointer group transform transition-all active:scale-98"
          >
            <StatCard
              title={t('dashboard.kpiTotalRequests')}
              value={stats.total_requests.toLocaleString()}
              subtitle={`${stats.voice_requests_count.toLocaleString()} Voice • ${stats.text_requests_count.toLocaleString()} Text`}
              trend={{ value: t('dashboard.title'), isPositive: true }}
              icon={<Users className="w-4 h-4 text-blue-600" />}
              variant="highlight"
            />
          </div>

          <div
            onClick={() => filterByIndicator('critical_needs')}
            className="cursor-pointer group transform transition-all active:scale-98"
          >
            <StatCard
              title={t('dashboard.kpiCriticalNeeds')}
              value={stats.high_priority_needs_count}
              subtitle={t('home.highPriorityNeedsSub')}
              trend={{ value: t('common.critical'), isPositive: false }}
              icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
              variant="critical"
            />
          </div>

          <div
            onClick={() => filterByIndicator('infra_gaps')}
            className="cursor-pointer group transform transition-all active:scale-98"
          >
            <StatCard
              title={t('dashboard.kpiInfraGaps')}
              value={stats.critical_infra_gaps_count}
              subtitle={t('home.infraGapsSub')}
              trend={{ value: t('map.infraDeficit'), isPositive: true }}
              icon={<Layers className="w-4 h-4 text-amber-600" />}
              variant="default"
            />
          </div>

          <div
            onClick={() => filterByIndicator('under_review')}
            className="cursor-pointer group transform transition-all active:scale-98"
          >
            <StatCard
              title={t('dashboard.kpiUnderReview')}
              value={stats.areas_under_review_count}
              subtitle={t('home.areasUnderReviewSub')}
              trend={{ value: t('nav.recommendations'), isPositive: true }}
              icon={<FileCheck2 className="w-4 h-4 text-emerald-600" />}
              variant="default"
            />
          </div>
        </div>
      )}

      {/* Section 1: Interactive Demand Hotspot Map with Region Drawer */}
      <HotspotMap hotspots={filteredHotspots} />

      {/* Section 2: Infrastructure Gap Matrix */}
      <GapAnalysis infrastructure={infrastructure} recommendations={filteredRecommendations} />

      {/* Section 3: Ingestion Trends & Category/Language Breakdown */}
      <TrendCharts stats={stats} />

      {/* Section 4: Ranked Explainable Priority Recommendations */}
      <RecommendationsList recommendations={filteredRecommendations} />

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
