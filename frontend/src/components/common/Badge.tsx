import React from 'react';
import { PriorityLevel } from '../../types';

export const PriorityBadge: React.FC<{ level: PriorityLevel | string; score?: number; size?: 'sm' | 'md' | 'lg' }> = ({
  level,
  score,
  size = 'md'
}) => {
  const norm = level.toUpperCase();
  
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
  if (norm === 'CRITICAL' || (score && score >= 85)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (norm === 'HIGH' || (score && score >= 75)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (norm === 'MEDIUM' || (score && score >= 60)) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (norm === 'LOW') {
    colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 font-bold tracking-wider'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${colorClasses} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        norm === 'CRITICAL' ? 'bg-rose-500 animate-pulse' :
        norm === 'HIGH' ? 'bg-amber-500' :
        norm === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-400'
      }`} />
      <span>{norm}</span>
      {score !== undefined && <span className="font-mono opacity-85">({score}/100)</span>}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  let colorStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  const c = category.toLowerCase();
  if (c.includes('transport') || c.includes('road')) {
    colorStyle = 'bg-slate-100 text-slate-800 border-slate-300';
  } else if (c.includes('water') || c.includes('sanitation')) {
    colorStyle = 'bg-sky-50 text-sky-800 border-sky-200';
  } else if (c.includes('health')) {
    colorStyle = 'bg-teal-50 text-teal-800 border-teal-200';
  } else if (c.includes('edu')) {
    colorStyle = 'bg-indigo-50 text-indigo-800 border-indigo-200';
  } else if (c.includes('waste')) {
    colorStyle = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (c.includes('power') || c.includes('energy')) {
    colorStyle = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border ${colorStyle}`}>
      {category}
    </span>
  );
};

export const LanguageBadge: React.FC<{ language: string; isVoice?: boolean }> = ({ language, isVoice }) => {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
      {isVoice && <span className="text-blue-600">🎙️</span>}
      <span>{language}</span>
    </span>
  );
};
