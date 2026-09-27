import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { PriorityBadge, CategoryBadge, LanguageBadge } from '../common/Badge';
import {
  Search,
  Filter,
  Download,
  Volume2,
  Calendar,
  Languages,
  RotateCcw,
  RefreshCw
} from 'lucide-react';

export const RequestExplorer: React.FC = () => {
  const {
    requests,
    filteredRequests,
    selectedCategory,
    setSelectedCategory,
    selectedDistrict,
    setSelectedDistrict,
    selectedLanguage,
    setSelectedLanguage,
    demographics,
    regions,
    hasActiveFilters,
    resetAllFilters,
    refreshData
  } = useApp();


  const { t, supportedLanguages } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVoice, setOnlyVoice] = useState(false);
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'verified' | 'baseline'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleResetFilters = () => {
    setSearchQuery('');
    setOnlyVoice(false);
    setSubmissionFilter('all');
    resetAllFilters();
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePlayVoice = (reqId: string) => {
    if (playingId === reqId) {
      setPlayingId(null);
    } else {
      setPlayingId(reqId);
      setTimeout(() => {
        setPlayingId(null);
      }, 3500);
    }
  };


  // Compute displayed requests combining global filters, local search query, voice filter, and submission source
  const displayedRequests = React.useMemo(() => {
    return filteredRequests.filter((r) => {
      if (onlyVoice && !r.is_voice) return false;
      if (submissionFilter === 'verified' && r.is_demo) return false;
      if (submissionFilter === 'baseline' && !r.is_demo) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = (
          r.raw_text.toLowerCase().includes(q) ||
          r.translated_text.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          (r.subcategory && r.subcategory.toLowerCase().includes(q)) ||
          r.request_id.toLowerCase().includes(q)
        );
        if (!matches) return false;
      }
      return true;
    });
  }, [filteredRequests, onlyVoice, submissionFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = 'ID,Date,Language,Channel,District,Category,Subcategory,Urgency,Severity,Source,OriginalText,Translation\n';
    const rows = displayedRequests
      .map((r) =>
        `"${r.request_id}","${r.created_at}","${r.language}","${r.is_voice ? 'Voice' : 'Text'}","${r.district}","${r.category}","${r.subcategory}","${r.urgency}","${r.severity}","${r.is_demo ? 'Baseline Demo' : 'Verified Citizen'}","${r.raw_text.replace(/"/g, '""')}","${r.translated_text.replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `civisense_requests_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              {t('nav.dataExplorer')}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Permanent Civic Database
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {t('explorer.title')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('explorer.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>


      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('explorer.searchPlaceholder')}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Submission Source Filter */}
          <div>
            <select
              value={submissionFilter}
              onChange={(e: any) => setSubmissionFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden cursor-pointer font-semibold"
            >
              <option value="all">📁 All Records</option>
              <option value="verified">✅ Verified Citizen Only</option>
              <option value="baseline">📊 Baseline Demo Only</option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden cursor-pointer font-medium"
            >
              <option value="All">{t('explorer.allLanguages')}</option>
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.name}>
                  {l.flag} {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden cursor-pointer font-medium"
            >
              <option value="All">{t('explorer.allCategories')}</option>
              <option value="Transportation">Transportation & Roads</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Waste Management">Waste Management</option>
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden cursor-pointer font-medium"
            >
              <option value="All">{t('dashboard.allDistricts')}</option>
              {(regions.length > 0 ? regions : demographics).map((r) => (
                <option key={r.district} value={r.district}>
                  {r.district} ({r.state})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkbox for Voice Only & Active Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={onlyVoice}
                onChange={(e) => setOnlyVoice(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>🎙️ Voice Input Channel</span>
            </label>

            <span className="text-slate-300">|</span>

            <span className="text-slate-700 font-mono text-[11px] font-semibold">
              Showing {displayedRequests.length} of {requests.length} records
            </span>
          </div>

          {(hasActiveFilters || searchQuery || onlyVoice || submissionFilter !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-all border border-slate-200"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>


      {/* Requests Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">{t('explorer.id')} & {t('explorer.date')}</th>
                <th className="px-4 py-3">Source & Channel</th>
                <th className="px-4 py-3">{t('explorer.voiceTextInput')}</th>
                <th className="px-4 py-3">{t('explorer.district')}</th>
                <th className="px-4 py-3">{t('explorer.sector')}</th>
                <th className="px-4 py-3">{t('explorer.urgency')}</th>
                <th className="px-4 py-3">Audio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal">
              {displayedRequests.map((req) => {
                const isPlaying = playingId === req.request_id;
                const isVerifiedCitizen = !req.is_demo;
                
                return (
                  <tr key={req.request_id} className={`transition-colors ${isVerifiedCitizen ? 'bg-emerald-50/25 hover:bg-emerald-50/50' : 'hover:bg-slate-50/80'}`}>
                    {/* ID & Date */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono">
                      <div className="font-bold text-slate-900">{req.request_id}</div>
                      <div className="text-[10px] text-slate-400">{req.created_at.slice(0, 10)}</div>
                      {isVerifiedCitizen ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 mt-1">
                          ✅ Verified Citizen
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 mt-1">
                          📊 Baseline Demo
                        </span>
                      )}
                    </td>

                    {/* Language & Channel */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <LanguageBadge language={req.language} isVoice={req.is_voice} />
                      <div className="text-[10px] text-slate-500 mt-1 font-medium">
                        {req.is_voice ? `🎙️ Voice (${req.voice_duration_sec || 12}s)` : '✍️ Direct Text'}
                      </div>
                    </td>

                    {/* Request Content */}
                    <td className="px-4 py-3 max-w-md">
                      {req.language !== 'English' && (
                        <div className="font-semibold text-slate-900 text-xs mb-1 leading-snug">
                          "{req.raw_text}"
                        </div>
                      )}
                      <div className="text-[11px] text-slate-700 italic bg-white p-2 rounded border border-slate-200 shadow-2xs">
                        "{req.translated_text || req.raw_text}"
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{req.district}</div>
                      <div className="text-[10px] text-slate-500">{req.state}, {req.country}</div>
                      {req.locality && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{req.locality}</div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <CategoryBadge category={req.category} />
                      <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[130px]">
                        {req.subcategory}
                      </div>
                    </td>

                    {/* Severity & Urgency */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityBadge level={req.urgency} score={req.severity * 10} size="sm" />
                    </td>

                    {/* Audio Playback Simulation */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {req.is_voice ? (
                        <button
                          onClick={() => handlePlayVoice(req.request_id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all border cursor-pointer ${
                            isPlaying
                              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                              : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border-slate-200'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isPlaying ? 'Playing...' : 'Play'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Text Only</span>
                      )}
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
