import React from 'react';
import { AIStructuredExtraction } from '../../types';
import { Sparkles, Tag, AlertTriangle, Users, Globe2, CheckCircle2 } from 'lucide-react';
import { PriorityBadge, CategoryBadge } from '../common/Badge';

interface LiveAIExtractorProps {
  extraction: AIStructuredExtraction | null;
  isLoading?: boolean;
}

export const LiveAIExtractor: React.FC<LiveAIExtractorProps> = ({
  extraction,
  isLoading
}) => {
  if (!extraction) {
    return (
      <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-400">
        <Sparkles className="w-6 h-6 mx-auto mb-2 text-slate-400" />
        <p className="text-xs font-medium text-slate-600">AI Structured Extraction Pipeline</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Type or speak your request to see real-time categorization, severity rating, and translation preview.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Real-Time AI Extraction
          </span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">
          Multilingual NLP Engine
        </span>
      </div>

      {/* Grid of Extracted Attributes */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Category */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Category
          </span>
          <CategoryBadge category={extraction.category} />
          <div className="text-[11px] text-slate-600 font-medium mt-1 truncate">
            {extraction.subcategory}
          </div>
        </div>

        {/* Severity & Urgency */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Severity & Urgency
          </span>
          <div className="flex items-center gap-2">
            <PriorityBadge level={extraction.urgency} score={extraction.severity * 10} size="sm" />
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full ${
                extraction.severity >= 9 ? 'bg-rose-600' : extraction.severity >= 7 ? 'bg-amber-600' : 'bg-blue-600'
              }`}
              style={{ width: `${extraction.severity * 10}%` }}
            />
          </div>
        </div>

        {/* Affected Group */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
            <Users className="w-3 h-3 text-slate-400" />
            <span>Affected Group</span>
          </div>
          <div className="text-xs font-semibold text-slate-800">
            {extraction.affected_group}
          </div>
        </div>

        {/* Detected Language */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
            <Globe2 className="w-3 h-3 text-slate-400" />
            <span>Language</span>
          </div>
          <div className="text-xs font-semibold text-slate-800">
            {extraction.language}
          </div>
        </div>
      </div>

      {/* English Translation Preview for Policymaker */}
      {extraction.language !== 'English' && (
        <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 text-xs">
          <div className="flex items-center gap-1.5 text-blue-900 font-bold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Standardized English Policy Translation:</span>
          </div>
          <p className="text-slate-700 italic font-medium leading-relaxed">
            "{extraction.translated_text}"
          </p>
        </div>
      )}

      {/* Extracted Entities */}
      {extraction.key_entities && extraction.key_entities.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <Tag className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Entities:</span>
          {extraction.key_entities.map((ent, i) => (
            <span
              key={i}
              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium"
            >
              {ent}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
