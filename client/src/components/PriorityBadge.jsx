import React from 'react';
import { AlertCircle, AlertTriangle, ArrowUpRight, Minus } from 'lucide-react';

const priorityConfig = {
  Critical: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertCircle
  },
  High: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertTriangle
  },
  Medium: {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: ArrowUpRight
  },
  Low: {
    bg: 'bg-slate-50 text-slate-600 border-slate-200',
    icon: Minus
  }
};

export default function PriorityBadge({ priority = 'Medium', showIcon = true }) {
  const cfg = priorityConfig[priority] || priorityConfig.Medium;
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${cfg.bg}`}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {priority}
    </span>
  );
}
