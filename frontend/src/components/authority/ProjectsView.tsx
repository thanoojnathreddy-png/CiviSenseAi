import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GovernmentProject } from '../../types';
import { CategoryBadge } from '../common/Badge';
import {
  Building2,
  DollarSign,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Search,
  Filter,
  Layers,
  XCircle
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const {
    filteredProjects,
    selectedCountry,
    selectedCategory,
    setSelectedCategory,
    selectedDistrict,
    setSelectedDistrict,
    globalSearchQuery,
    setGlobalSearchQuery,
    hasActiveFilters,
    resetAllFilters,
    demographics,
    setAuthoritySubTab
  } = useApp();

  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const displayedProjects = filteredProjects.filter((p) => {
    if (selectedStatus !== 'All' && p.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              Public Works Registry
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Existing & Planned Development Allocations
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Government Development Projects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-referencing ongoing public works against citizen demand to identify coverage gaps and prevent duplicative infrastructure outlays.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-500 block">Active Projects Monitored</span>
          <span className="text-xl font-extrabold font-mono text-slate-900">{displayedProjects.length} Public Works</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search project title, agency, or district..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Delayed">Delayed</option>
              <option value="Completed">Completed</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="All">All Sectors</option>
              <option value="Transportation">Transportation</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Power & Energy">Power & Energy</option>
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {displayedProjects.map((proj) => {
          let statusBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
          if (proj.status === 'Completed') statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          else if (proj.status === 'In Progress') statusBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
          else if (proj.status === 'Delayed') statusBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';

          return (
            <div key={proj.project_id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">{proj.project_id}</span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{proj.title}</h3>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusBadgeClass} shrink-0`}>
                    {proj.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <CategoryBadge category={proj.category} />
                  <span className="text-slate-500 font-medium">
                    {proj.district}, {proj.state} ({proj.country})
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-normal">
                  <span className="font-semibold text-slate-700">Agency:</span> {proj.implementing_agency}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Physical Completion</span>
                  <span className="font-mono">{proj.completion_percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      proj.completion_percentage >= 100 ? 'bg-emerald-600' : proj.status === 'Delayed' ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${proj.completion_percentage}%` }}
                  />
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Allocated Budget</span>
                  <span className="font-bold text-slate-900 font-mono text-xs">₹{proj.budget_allocated_inr_cr} Cr</span>
                  <span className="text-[10px] text-slate-400 block font-mono">(${proj.budget_allocated_usd_m}M)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Target Reach</span>
                  <span className="font-bold text-slate-900 font-mono text-xs">~{proj.target_population.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block">residents</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Target Date</span>
                  <span className="font-bold text-slate-900 font-mono text-xs">{proj.target_completion_date}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
