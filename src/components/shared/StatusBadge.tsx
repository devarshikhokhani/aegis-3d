import React from 'react';
import { FSMState, SeverityLevel } from '../../types/simulation';

export const FSMStateBadge: React.FC<{ state: FSMState; size?: 'sm' | 'md' | 'lg' }> = ({ state, size = 'md' }) => {
  const styles: Record<FSMState, { bg: string; text: string; border: string; dot: string; pulse: boolean }> = {
    NORMAL: {
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-400',
      border: 'border-emerald-800/80',
      dot: 'bg-emerald-400',
      pulse: false,
    },
    MONITORING: {
      bg: 'bg-cyan-950/60',
      text: 'text-cyan-400',
      border: 'border-cyan-800/80',
      dot: 'bg-cyan-400',
      pulse: true,
    },
    WARNING: {
      bg: 'bg-amber-950/60',
      text: 'text-amber-400',
      border: 'border-amber-800/80',
      dot: 'bg-amber-400',
      pulse: true,
    },
    ALARM_STAGE_1: {
      bg: 'bg-amber-950/80',
      text: 'text-amber-300',
      border: 'border-amber-600',
      dot: 'bg-amber-400',
      pulse: true,
    },
    ALARM_STAGE_2: {
      bg: 'bg-red-950/90',
      text: 'text-red-400 font-bold',
      border: 'border-red-600 animate-pulse',
      dot: 'bg-red-500 animate-ping',
      pulse: true,
    },
    RECOVERY: {
      bg: 'bg-blue-950/60',
      text: 'text-blue-400',
      border: 'border-blue-800/80',
      dot: 'bg-blue-400',
      pulse: true,
    },
    FAULT: {
      bg: 'bg-purple-950/60',
      text: 'text-purple-400',
      border: 'border-purple-800/80',
      dot: 'bg-purple-400',
      pulse: false,
    },
    OVERRIDE: {
      bg: 'bg-orange-950/60',
      text: 'text-orange-400',
      border: 'border-orange-800/80',
      dot: 'bg-orange-400',
      pulse: false,
    },
  };

  const current = styles[state] || styles.NORMAL;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : size === 'lg' ? 'px-3.5 py-1.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center space-x-1.5 rounded font-mono uppercase tracking-wider border ${current.bg} ${current.text} ${current.border} ${padding}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{state.replace(/_/g, ' ')}</span>
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: SeverityLevel }> = ({ severity }) => {
  const styles: Record<SeverityLevel, { bg: string; text: string; border: string }> = {
    NORMAL: { bg: 'bg-emerald-950/50', text: 'text-emerald-400', border: 'border-emerald-800' },
    LOW: { bg: 'bg-blue-950/50', text: 'text-blue-400', border: 'border-blue-800' },
    MEDIUM: { bg: 'bg-amber-950/50', text: 'text-amber-400', border: 'border-amber-800' },
    HIGH: { bg: 'bg-orange-950/50', text: 'text-orange-400', border: 'border-orange-800' },
    CRITICAL: { bg: 'bg-red-950/70', text: 'text-red-400 font-bold', border: 'border-red-600' },
  };

  const current = styles[severity] || styles.NORMAL;

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${current.bg} ${current.text} ${current.border}`}>
      {severity}
    </span>
  );
};
