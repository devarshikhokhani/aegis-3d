import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-industrial-950 border-t border-industrial-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 select-none z-30">
      <div className="flex items-center space-x-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="font-mono text-cyan-400 font-semibold tracking-wider uppercase">SIMULATION ENVIRONMENT</span>
        <span className="text-slate-600">|</span>
        <span className="truncate hidden sm:inline">
          AEGIS 3D is an educational digital twin simulation for Digital Electronics. Not a certified industrial safety system; controls no real equipment.
        </span>
      </div>
      <div className="flex items-center space-x-3 text-slate-500 font-mono text-[10px]">
        <span>ENGINE v1.0.4-LGC</span>
        <span className="hidden md:inline">RUNNING DETERMINISTIC</span>
      </div>
    </div>
  );
};
