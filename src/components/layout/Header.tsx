import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  StepForward, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Layers, 
  HelpCircle,
  Activity
} from 'lucide-react';
import { simulationStore, SimulationState } from '../../engine/simulationStore';
import { audioService } from '../../engine/audioService';
import { FSMStateBadge } from '../shared/StatusBadge';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  state: SimulationState;
  onOpenResetModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ state, onOpenResetModal }) => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(audioService.getMuted());

  const handleToggleMute = () => {
    const next = audioService.toggleMute();
    setIsMuted(next);
  };

  const activeIncidents = state.incidents.filter(i => !i.resolved);
  const emergencyZones = Object.values(state.zones).filter(z => z.status === 'EMERGENCY');

  // Format uptime as HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <header className="h-14 bg-industrial-950 border-b border-industrial-800/90 px-4 flex items-center justify-between select-none z-20">
      {/* Brand & Tagline */}
      <div className="flex items-center space-x-3">
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-700 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
            <div className="w-full h-full bg-industrial-950 rounded-[3px] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-cyan-neon" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-base font-extrabold tracking-wider text-slate-100 group-hover:text-cyan-neon transition-colors">
                AEGIS<span className="text-cyan-neon"> 3D</span>
              </span>
              <span className="text-[10px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 px-1 rounded font-mono">
                SIM
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
              DETECT. ANALYSE. RESPOND.
            </p>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-industrial-800 mx-2 hidden md:block" />

        {/* Master Controller State */}
        <div className="hidden lg:flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-400">CONTROLLER:</span>
          <FSMStateBadge state={state.fsmState} size="sm" />
        </div>
      </div>

      {/* Center: Live Metrics & Active Incidents Alert */}
      <div className="flex items-center space-x-3">
        {/* Active Alert Pill */}
        {activeIncidents.length > 0 ? (
          <div 
            onClick={() => navigate('/incidents')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-red-950/80 border border-red-600/80 text-red-400 text-xs font-mono font-bold cursor-pointer hover:bg-red-900/60 transition-all animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>{activeIncidents.length} ACTIVE INCIDENT{activeIncidents.length > 1 ? 'S' : ''}</span>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>ALL 6 ZONES SAFE</span>
          </div>
        )}

        {/* Priority Encoder Pill */}
        {state.fsmState === 'ALARM_STAGE_2' && (
          <div className="hidden xl:flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/70 text-amber-400 font-mono text-[11px]">
            <Activity className="w-3 h-3 text-amber-400" />
            <span>PRIORITY ENCODER LATCHED</span>
          </div>
        )}
      </div>

      {/* Right Controls: Simulation Ticker, Audio, Reset */}
      <div className="flex items-center space-x-2.5">
        {/* Simulation Clock */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2 py-1 rounded bg-industrial-900 border border-industrial-800 text-slate-300 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>T+{formatTime(state.uptimeSeconds)}</span>
        </div>

        {/* Play / Pause Toggle */}
        <button
          onClick={() => simulationStore.togglePlayPause()}
          className="p-1.5 rounded bg-industrial-850 hover:bg-industrial-800 border border-industrial-700 text-slate-200 transition-colors"
          title={state.simulationRunning ? 'Pause Simulation' : 'Resume Simulation'}
        >
          {state.simulationRunning ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Step Forward Tick */}
        <button
          onClick={() => simulationStore.stepTick()}
          className="p-1.5 rounded bg-industrial-850 hover:bg-industrial-800 border border-industrial-700 text-slate-200 transition-colors"
          title="Step Single Tick Forward"
        >
          <StepForward className="w-4 h-4 text-slate-300" />
        </button>

        {/* Speed Selector */}
        <div className="flex items-center bg-industrial-900 border border-industrial-800 rounded p-0.5 text-[11px] font-mono">
          {[0.5, 1, 2, 5].map((spd) => (
            <button
              key={spd}
              onClick={() => simulationStore.setSpeed(spd)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                state.simulationSpeed === spd 
                  ? 'bg-cyan-500 text-industrial-950 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Web Audio Mute / Unmute */}
        <button
          onClick={handleToggleMute}
          className={`p-1.5 rounded border transition-colors ${
            isMuted 
              ? 'bg-industrial-850 text-slate-400 border-industrial-800 hover:text-slate-200' 
              : 'bg-cyan-950/60 text-cyan-400 border-cyan-800 hover:bg-cyan-900/60'
          }`}
          title={isMuted ? 'Sound Muted (Click to Unmute Sirens)' : 'Sound Enabled (Click to Mute)'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
        </button>

        {/* Guided Demo Launch */}
        <button
          onClick={() => navigate('/guided-demo')}
          className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded bg-cyan-950/70 border border-cyan-600/50 hover:bg-cyan-900/50 text-cyan-300 text-xs font-mono font-medium transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Demo Tour</span>
        </button>

        {/* Reset Simulation with Modal Trigger */}
        <button
          onClick={onOpenResetModal}
          className="p-1.5 rounded bg-industrial-850 hover:bg-red-950/60 border border-industrial-800 hover:border-red-700 text-slate-300 hover:text-red-400 transition-colors"
          title="Reset Simulation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
