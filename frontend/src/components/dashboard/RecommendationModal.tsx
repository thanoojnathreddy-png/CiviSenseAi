import React, { useState } from 'react';
import { AIPriorityRecommendation } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { PriorityBadge, CategoryBadge, LanguageBadge } from '../common/Badge';
import { apiService } from '../../services/api';
import {
  Sparkles,
  Calculator,
  FileCheck2,
  Download,
  CheckCircle2,
  Users,
  Building,
  Target,
  DollarSign,
  Calendar,
  Layers,
  MessageSquare,
  ShieldCheck,
  Award
} from 'lucide-react';

interface RecommendationModalProps {
  rec: AIPriorityRecommendation | null;
  onClose: () => void;
}

export const RecommendationModal: React.FC<RecommendationModalProps> = ({
  rec,
  onClose
}) => {
  const { setLiveNotification, refreshData } = useApp();
  const [status, setStatus] = useState<string>(rec?.status || 'Pending Review');
  const [isApproving, setIsApproving] = useState<boolean>(false);

  if (!rec) return null;

  const handleApproveDPR = async () => {
    setIsApproving(true);
    try {
      await apiService.updateRecommendationStatus(rec.recommendation_id, 'Approved for DPR');
      setStatus('Approved for DPR');
      setLiveNotification({
        message: `✅ Priority Intervention #${rec.recommendation_id} approved for Detailed Project Report (DPR)!`,
        type: 'success'
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleExportBrief = () => {
    const briefContent = {
      platform: 'CivicPulse AI — Digital Public Good',
      export_date: new Date().toISOString(),
      recommendation_id: rec.recommendation_id,
      title: rec.title,
      priority_score: `${rec.priority_score}/100 (${rec.priority_level})`,
      region: `${rec.district}, ${rec.state}, ${rec.country}`,
      citizen_demand_count: rec.citizen_requests_count,
      affected_population: rec.affected_population_estimate,
      infrastructure_index: `${rec.infrastructure_index_score}/100`,
      existing_matching_projects: rec.existing_matching_projects_count,
      ai_reasoning: rec.ai_reasoning,
      factor_breakdown: rec.factor_breakdown,
      suggested_intervention: rec.suggested_intervention,
      supporting_citizen_quotes: rec.sample_citizen_quotes
    };

    const blob = new Blob([JSON.stringify(briefContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CivicPulse_Policy_Brief_${rec.recommendation_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fb = rec.factor_breakdown;

  return (
    <Modal
      isOpen={Boolean(rec)}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-extrabold text-slate-900 text-lg">{rec.title}</span>
          <PriorityBadge level={rec.priority_level} score={rec.priority_score} size="lg" />
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            {rec.region_id}
          </span>
        </div>
      }
      subtitle={`Location: ${rec.district}, ${rec.state} (${rec.country}) • Sector: ${rec.category}`}
    >
      <div className="space-y-6 text-xs text-slate-700">
        {/* Status Bar */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Policy Workflow Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono ${
              status === 'Approved for DPR' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBrief}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold transition-all shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Policy Brief</span>
            </button>
            <button
              onClick={handleApproveDPR}
              disabled={isApproving || status === 'Approved for DPR'}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-emerald-600 text-white font-bold transition-all shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{status === 'Approved for DPR' ? 'Sanctioned for DPR' : 'Approve for DPR'}</span>
            </button>
          </div>
        </div>

        {/* Section 1: Explainable Mathematical Score Breakdown */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Transparent Priority Scoring Formula Breakdown
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Score = Σ(Weight × Factor) = {rec.priority_score}/100
            </span>
          </div>

          {/* Formula Chips Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {/* Factor 1 */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Citizen Demand (30%)</span>
                <span className="text-base font-bold font-mono text-blue-600">{fb.citizen_demand_score}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                {rec.citizen_requests_count} verified requests
              </div>
            </div>

            {/* Factor 2 */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Infra Deficit (25%)</span>
                <span className="text-base font-bold font-mono text-rose-600">{fb.infrastructure_gap_score}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                100 - {rec.infrastructure_index_score.toFixed(0)} index
              </div>
            </div>

            {/* Factor 3 */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Population Scale (20%)</span>
                <span className="text-base font-bold font-mono text-slate-800">{fb.population_impact_score}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                ~{rec.affected_population_estimate.toLocaleString()} citizens
              </div>
            </div>

            {/* Factor 4 */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Urgency / Severity (15%)</span>
                <span className="text-base font-bold font-mono text-amber-600">{fb.severity_urgency_score}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                Avg Rating 8.8/10
              </div>
            </div>

            {/* Factor 5 */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Project Deficit (10%)</span>
                <span className="text-base font-bold font-mono text-indigo-600">{fb.project_deficit_score}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                {rec.existing_matching_projects_count === 0 ? '0 matching works' : `${rec.existing_matching_projects_count} existing`}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: AI Plain-Language Reasoning Narrative */}
        <div className="bg-blue-50/70 rounded-xl border border-blue-100 p-5 space-y-2">
          <div className="flex items-center gap-2 text-blue-950 font-bold">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs uppercase tracking-wider">AI Explainability & Justification</h3>
          </div>
          <p className="text-slate-800 leading-relaxed font-normal text-xs bg-white p-4 rounded-lg border border-blue-200/60 shadow-2xs">
            {rec.ai_reasoning}
          </p>
        </div>

        {/* Section 3: Direct Citizen Voice Evidence */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Direct Citizen Voice Evidence (Multilingual Quotes)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              Sample of {rec.sample_citizen_quotes.length} verified submissions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rec.sample_citizen_quotes.map((quote, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <LanguageBadge language={quote.language} isVoice={quote.is_voice} />
                  <span className="text-[10px] text-slate-400 font-mono">ID: {quote.request_id}</span>
                </div>

                {quote.language !== 'English' && (
                  <p className="text-slate-900 font-medium text-[11px] leading-relaxed">
                    "{quote.raw_text}"
                  </p>
                )}

                <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[11px] text-slate-700 italic">
                  <span className="font-semibold text-slate-500 not-italic">English Translation: </span>
                  "{quote.translated_text}"
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Location: {quote.locality}</span>
                  <span className="font-mono font-bold text-rose-600">Severity: {quote.severity}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Proposed Public Works Intervention (DPR Specs) */}
        <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Suggested Public Works Intervention & DPR Blueprint
              </h3>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
              Ready for Administrative Sanction
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span className="uppercase text-[10px] font-bold">Estimated Outlay</span>
              </div>
              <div className="text-base font-extrabold font-mono text-emerald-400">
                ₹{rec.suggested_intervention.estimated_cost_inr_cr} Cr
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                (~${rec.suggested_intervention.estimated_cost_usd_m}M USD)
              </div>
            </div>

            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span className="uppercase text-[10px] font-bold">Execution Timeline</span>
              </div>
              <div className="text-base font-extrabold font-mono text-white">
                {rec.suggested_intervention.estimated_timeline_months} Months
              </div>
              <div className="text-[10px] text-slate-400">
                Fast-track DPR window
              </div>
            </div>

            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span className="uppercase text-[10px] font-bold">Implementing Agency</span>
              </div>
              <div className="text-xs font-bold text-white leading-tight">
                {rec.suggested_intervention.implementation_agency}
              </div>
            </div>
          </div>

          {/* Deliverables List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Core Engineering Deliverables:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {rec.suggested_intervention.key_deliverables.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-800/80 p-2 rounded border border-slate-700 text-slate-200 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SDG Alignment */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">UN SDG Alignment:</span>
            {rec.suggested_intervention.sdg_alignment.map((sdg, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {sdg}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
