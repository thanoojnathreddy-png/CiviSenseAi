import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'critical';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default'
}) => {
  let borderClass = 'border-slate-200';
  let accentBar = 'bg-blue-600';
  if (variant === 'critical') {
    borderClass = 'border-rose-200';
    accentBar = 'bg-rose-600';
  } else if (variant === 'highlight') {
    borderClass = 'border-blue-200';
    accentBar = 'bg-blue-600';
  }

  return (
    <div className={`bg-white rounded-lg border ${borderClass} p-4 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentBar}`} />
      
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {icon && <div className="text-slate-400 p-1 bg-slate-50 rounded border border-slate-100">{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">{value}</span>
        {trend && (
          <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-700' : 'text-slate-500'}`}>
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-normal leading-relaxed line-clamp-1">{subtitle}</p>
      )}
    </div>
  );
};
