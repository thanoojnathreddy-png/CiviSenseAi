import React, { useState, useMemo } from 'react';
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
  Calendar
} from 'lucide-react';

export const CommunityNeedsView: React.FC = () => {
  const { communityNeeds, setSelectedRecModal, recommendations, selectedCountry } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  const filteredNeeds = useMemo(() => {
    return communityNeeds.filter((need) => {
      if (selectedCountry && selectedCountry !== 'All' && need.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;
      if (selectedCategory !== 'All' && need.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (selectedPriority !== 'All' && need.priority_level.toUpperCase() !== selectedPriority.toUpperCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          need.title.toLowerCase().includes(q) ||
          need.district.toLowerCase().includes(q) ||
          need.category.toLowerCase().includes(q) ||
          need.key_issues.some((i) => i.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [communityNeeds, selectedCountry, selectedCategory, selectedPriority, searchQuery]);

  const handleOpenRec = (district: string) => {
    const matched = recommendations.find((r) => r.district.toLowerCase() === district.toLowerCase());
    if (matched) {
      setSelectedRecModal(matched);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              Semantic Aggregation
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Community-Level Demand Clusters
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Aggregated Community Development Needs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual citizen feedback is semantically aggregated into broader infrastructure demands to identify true community priorities.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-500 block">Total Tracked Demands</span>
          <span className="text-xl font-extrabold font-mono text-slate-900">{filteredNeeds.length} Community Clusters</span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <option value="All">All Categories</option>
              <option value="Transportation">Transportation & Roads</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Healthcare">Healthcare Facilities</option>
              <option value="Education">Education & Schools</option>
              <option value="Waste Management">Waste & Drainage</option>
              <option value="Power & Energy">Power & Energy</option>
            </select>
          </div>

          {/* Priority Level Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="All">All Priority Levels</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Community Needs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Community Need & Issues</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Citizen Demand</th>
                <th className="px-4 py-3.5">Affected Population</th>
                <th className="px-4 py-3.5">Demand Trend</th>
                <th className="px-4 py-3.5">Infra Condition</th>
                <th className="px-4 py-3.5">Priority Assessment</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal">
              {filteredNeeds.map((need) => {
                const isCritical = need.priority_level === 'CRITICAL';
                
                return (
                  <tr key={need.need_id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Title & Key Issues */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-bold text-slate-900 text-sm leading-snug">{need.title}</div>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                        <CategoryBadge category={need.category} />
                        {need.key_issues.slice(0, 2).map((issue, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{need.district}</div>
                      <div className="text-[10px] text-slate-500">{need.state}, {need.country}</div>
                    </td>

                    {/* Requests Count */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-bold font-mono text-slate-900 text-sm">
                        {need.citizen_requests_count.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block">verified requests</span>
                    </td>

                    {/* Affected Pop */}
                    <td className="px-4 py-4 whitespace-nowrap font-mono font-medium text-slate-800">
                      ~{need.affected_population_estimate.toLocaleString()}
                    </td>

                    {/* Trend */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        need.demand_trend === 'Increasing' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        <TrendingUp className="w-3 h-3" />
                        <span>{need.demand_trend}</span>
                      </span>
                    </td>

                    {/* Infra Condition */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          need.infrastructure_condition === 'Low' ? 'bg-rose-600' : need.infrastructure_condition === 'Medium' ? 'bg-amber-600' : 'bg-emerald-600'
                        }`} />
                        <span className="font-medium text-slate-800">{need.infrastructure_condition}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({need.infrastructure_index_score.toFixed(0)}/100)</span>
                      </div>
                    </td>

                    {/* Priority Score */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <PriorityBadge level={need.priority_level} score={need.priority_score} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenRec(need.district)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-all border border-blue-200"
                      >
                        <span>View Analysis</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
