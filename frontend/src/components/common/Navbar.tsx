import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation, SupportedLanguageCode } from '../../i18n';
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
  Languages
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    mainTab,
    setMainTab,
    authoritySubTab,
    setAuthoritySubTab,
    selectedCountry,
    setSelectedCountry,
    availableCountries,
    isLoading
  } = useApp();

  const { t, language, setLanguage, supportedLanguages } = useTranslation();

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
                <span className="font-extrabold text-base tracking-tight text-white">{t('nav.brand')}</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-400/30 font-mono">
                  AI
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {t('nav.dpgBadge')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {t('nav.subtitle')}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setMainTab('home')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                mainTab === 'home'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('nav.publicPortal')}</span>
            </button>

            <button
              onClick={() => setMainTab('citizen')}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                mainTab === 'citizen'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>{t('nav.shareNeed')}</span>
            </button>

            <button
              onClick={() => setMainTab('authority')}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                mainTab === 'authority'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t('nav.authorityPortal')}</span>
            </button>
          </nav>

          {/* Right Controls: Language Selector & Country Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dynamic Language Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-800 px-2.5 py-1.5 rounded-md border border-slate-700 text-xs transition-colors">
              <Languages className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="hidden xl:inline text-slate-400 font-medium">
                {t('nav.language')}:
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguageCode)}
                className="bg-transparent text-slate-100 text-xs font-semibold focus:outline-hidden cursor-pointer"
                aria-label="Select User Interface Language"
              >
                {supportedLanguages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.flag} {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Country Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-md border border-slate-700 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-hidden cursor-pointer"
                aria-label="Filter Country"
              >
                {availableCountries.map((c) => {
                  const flag = c === 'India' ? '🇮🇳 ' : c === 'Brazil' ? '🇧🇷 ' : c === 'South Africa' ? '🇿🇦 ' : '🌐 ';
                  return (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {flag}{c}
                    </option>
                  );
                })}
                <option value="All" className="bg-slate-900 text-white">{t('nav.allBrics')}</option>
              </select>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 border-l border-slate-800 pl-3">
              <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <span className="font-mono">{isLoading ? t('nav.syncing') : t('nav.systemActive')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Sub-Navbar for Authority Portal */}
      {mainTab === 'authority' && (
        <div className="bg-slate-950/80 border-t border-slate-800 px-4 sm:px-6 lg:px-8 py-1.5 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-1 text-xs font-medium whitespace-nowrap">
            {[
              { id: 'overview', label: t('nav.overview'), icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'needs', label: t('nav.communityNeeds'), icon: <BarChart3 className="w-3.5 h-3.5" /> },
              { id: 'map', label: t('nav.demandMap'), icon: <MapPin className="w-3.5 h-3.5" /> },
              { id: 'infrastructure', label: t('nav.infrastructure'), icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'recommendations', label: t('nav.recommendations'), icon: <Sparkles className="w-3.5 h-3.5" /> },
              { id: 'projects', label: t('nav.developmentProjects'), icon: <Building2 className="w-3.5 h-3.5" /> },
              { id: 'insights', label: t('nav.insights'), icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { id: 'explorer', label: t('nav.dataExplorer'), icon: <Database className="w-3.5 h-3.5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAuthoritySubTab(tab.id as AuthoritySubTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
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
