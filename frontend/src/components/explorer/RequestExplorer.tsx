import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CitizenRequestRecord } from '../../types';
import { PriorityBadge, CategoryBadge, LanguageBadge } from '../common/Badge';
import {
  Search,
  Filter,
  Download,
  Volume2,
  FileText,
  MapPin,
  Calendar,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const RequestExplorer: React.FC = () => {
  const { requests, selectedCountry, regions, demographics } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [minSeverity, setMinSeverity] = useState<number>(0);
  const [onlyVoice, setOnlyVoice] = useState<boolean>(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (selectedCountry && selectedCountry !== 'All' && r.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;
      if (selectedLanguage !== 'All' && r.language.toLowerCase() !== selectedLanguage.toLowerCase()) return false;
      if (selectedCategory !== 'All' && r.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (selectedDistrict !== 'All' && r.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      if (minSeverity > 0 && r.severity < minSeverity) return false;
      if (onlyVoice && !r.is_voice) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText =
          r.raw_text.toLowerCase().includes(q) ||
          r.translated_text.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q) ||
          r.request_id.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      return true;
    });
  }, [requests, selectedCountry, selectedLanguage, selectedCategory, selectedDistrict, minSeverity, onlyVoice, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['Request ID', 'Created At', 'Country', 'State', 'District', 'Language', 'Is Voice', 'Category', 'Subcategory', 'Severity', 'Urgency', 'Affected Group', 'Original Text', 'English Translation'];
    const rows = filteredRequests.map((r) => [
      r.request_id,
      r.created_at,
      r.country,
      r.state,
      r.district,
      r.language,
      r.is_voice ? 'Yes' : 'No',
      r.category,
      r.subcategory,
      r.severity,
      r.urgency,
      r.affected_group,
      `"${r.raw_text.replace(/"/g, '""')}"`,
      `"${r.translated_text.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivicPulse_Requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePlayVoice = (reqId: string) => {
    setPlayingId(reqId);
    setTimeout(() => {
      setPlayingId(null);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              Raw Signal Intelligence
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Multilingual Citizen Submissions Grid
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Citizen Development Request Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full audit log of {filteredRequests.length} verified citizen inputs with audio playback, original native script, and automated English translations.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Filtered CSV Dataset</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keywords, Telugu/Hindi script, district, or ID..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden cursor-pointer font-medium"
            >
              <option value="All">All Languages</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="English">English</option>
              <option value="Portuguese">Portuguese (Português)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden cursor-pointer font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Transportation">Transportation</option>
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
              <option value="All">All Districts</option>
              {(regions.length > 0 ? regions : demographics).map((r) => (
                <option key={r.district} value={r.district}>
                  {r.district} ({r.state})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkbox for Voice Only */}
        <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
          <label className="flex items-center gap-1.5 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={onlyVoice}
              onChange={(e) => setOnlyVoice(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span>Show Voice Submissions Only (🎙️)</span>
          </label>

          <span className="text-slate-300">|</span>

          <span className="text-slate-500 font-mono text-[11px]">
            Showing {filteredRequests.length} of {requests.length} total records
          </span>
        </div>
      </div>

      {/* Requests Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">ID & Date</th>
                <th className="px-4 py-3">Language & Channel</th>
                <th className="px-4 py-3">Citizen Request (Raw & Translated)</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Severity & Urgency</th>
                <th className="px-4 py-3">Audio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal">
              {filteredRequests.map((req) => {
                const isPlaying = playingId === req.request_id;
                
                return (
                  <tr key={req.request_id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID & Date */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono">
                      <div className="font-bold text-slate-900">{req.request_id}</div>
                      <div className="text-[10px] text-slate-400">{req.created_at.slice(0, 10)}</div>
                    </td>

                    {/* Language & Channel */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <LanguageBadge language={req.language} isVoice={req.is_voice} />
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {req.is_voice ? `Voice (${req.voice_duration_sec}s)` : 'Direct Text'}
                      </div>
                    </td>

                    {/* Request Content */}
                    <td className="px-4 py-3 max-w-md">
                      {req.language !== 'English' && (
                        <div className="font-semibold text-slate-900 text-xs mb-1 leading-snug">
                          "{req.raw_text}"
                        </div>
                      )}
                      <div className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">
                        "{req.translated_text}"
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{req.district}</div>
                      <div className="text-[10px] text-slate-500">{req.state}, {req.country}</div>
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
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all border ${
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
