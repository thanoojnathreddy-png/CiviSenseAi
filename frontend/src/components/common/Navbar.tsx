import React from 'react';
import { useApp } from '../../context/AppContext';
import { MainTab, AuthoritySubTab } from '../../types';
import {
  Activity,
  Globe,
  Home,
  MessageSquarePlus,
  Compass,
  Layers,
  MapPin,
  BarChart3,
  Sparkles,
  Building2,
  TrendingUp,
  Database,
  ShieldCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    mainTab,
    setMainTab,
    authoritySubTab,
    setAuthoritySubTab,
    selectedCountry,
    setSelectedCountry,
    isLoading
  } = useApp();

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Digital Public Good Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setMainTab('home')}
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/30 border border-blue-400/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">CivicPulse</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-400/30 font-mono">
                  AI
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Digital Public Good
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Multilingual Civic Intelligence & Infrastructure Prioritization
              </p>
            </div>
          </div>

          {/* Center Main Role Navigation */}
          <nav className="flex items-center bg-slate-800/90 p-1 rounded-lg border border-slate-700/80 text-xs font-medium">
            <button
              onClick={() => setMainTab('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                mainTab === 'home'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Public Home</span>
            </button>

            <button
              onClick={() => setMainTab('citizen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                mainTab === 'citizen'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Citizen Portal</span>
            </button>

            <button
              onClick={() => setMainTab('authority')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                mainTab === 'authority'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Public Authority Portal</span>
            </button>
          </nav>

          {/* Right Controls: Country Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-md border border-slate-700 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="India" className="bg-slate-900 text-white">🇮🇳 India</option>
                <option value="Brazil" className="bg-slate-900 text-white">🇧🇷 Brazil</option>
                <option value="South Africa" className="bg-slate-900 text-white">🇿🇦 South Africa</option>
                <option value="All" className="bg-slate-900 text-white">🌍 All BRICS Nations</option>
              </select>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 border-l border-slate-800 pl-3">
              <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <span className="font-mono">{isLoading ? 'Syncing...' : 'System Active'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Sub-Navbar for Authority Portal */}
      {mainTab === 'authority' && (
        <div className="bg-slate-950/80 border-t border-slate-800 px-4 sm:px-6 lg:px-8 py-1.5 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-1 text-xs font-medium whitespace-nowrap">
            {[
              { id: 'overview', label: 'Overview', icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'needs', label: 'Community Needs', icon: <BarChart3 className="w-3.5 h-3.5" /> },
              { id: 'map', label: 'Demand Map', icon: <MapPin className="w-3.5 h-3.5" /> },
              { id: 'infrastructure', label: 'Infrastructure', icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'recommendations', label: 'Recommendations', icon: <Sparkles className="w-3.5 h-3.5" /> },
              { id: 'projects', label: 'Development Projects', icon: <Building2 className="w-3.5 h-3.5" /> },
              { id: 'insights', label: 'Insights', icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { id: 'explorer', label: 'Data Explorer', icon: <Database className="w-3.5 h-3.5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAuthoritySubTab(tab.id as AuthoritySubTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  authoritySubTab === tab.id
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
