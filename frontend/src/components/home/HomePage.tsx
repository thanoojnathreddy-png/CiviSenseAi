import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import {
  MessageSquarePlus,
  Compass,
  ArrowRight,
  ShieldCheck,
  Globe,
  Layers,
  Building,
  CheckCircle2
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setMainTab, setAuthoritySubTab, stats, filterByIndicator } = useApp();
  const { t } = useTranslation();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 shadow-xs relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold uppercase tracking-wider font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>{t('home.dpgPlatform')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t('home.heroTitle')}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              {t('home.heroSubtitle')}
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => setMainTab('citizen')}
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm shadow-sm transition-all text-center cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>{t('home.shareNeedBtn')}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => {
                  setAuthoritySubTab('overview');
                  setMainTab('authority');
                }}
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 font-semibold text-sm border border-slate-300 transition-all text-center cursor-pointer"
              >
                <Compass className="w-4 h-4 text-slate-600" />
                <span>{t('home.explorePrioritiesBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Public Indicators Banner (Interactive) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => filterByIndicator('total')}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">{t('home.totalSignals')}</span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block group-hover:text-blue-600 transition-colors">
              {stats ? stats.total_requests.toLocaleString() : '24,836'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">{t('home.totalSignalsSub')}</span>
          </div>

          <div
            onClick={() => filterByIndicator('critical_needs')}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-rose-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">{t('home.highPriorityNeeds')}</span>
            <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block">
              {stats ? stats.high_priority_needs_count : '37'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">{t('home.highPriorityNeedsSub')}</span>
          </div>

          <div
            onClick={() => filterByIndicator('infra_gaps')}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">{t('home.infraGaps')}</span>
            <span className="text-2xl font-bold font-mono text-amber-600 mt-1 block">
              {stats ? stats.critical_infra_gaps_count : '82'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">{t('home.infraGapsSub')}</span>
          </div>

          <div
            onClick={() => filterByIndicator('under_review')}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">{t('home.areasUnderReview')}</span>
            <span className="text-2xl font-bold font-mono text-blue-600 mt-1 block">
              {stats ? stats.areas_under_review_count : '24'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">{t('home.areasUnderReviewSub')}</span>
          </div>
        </div>
      </section>

      {/* Decision-Support Process Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('home.howItWorksTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {t('home.howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm font-mono">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('home.step1Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {t('home.step1Desc')}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm font-mono">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('home.step2Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {t('home.step2Desc')}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm font-mono">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('home.step3Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {t('home.step3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">CivicPulse AI</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {t('home.govTitle')}
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {t('home.govSubtitle')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('home.principle1Title')}</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {t('home.principle1Desc')}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('home.principle2Title')}</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {t('home.principle2Desc')}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('home.principle3Title')}</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {t('home.principle3Desc')}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t('home.principle4Title')}</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {t('home.principle4Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
