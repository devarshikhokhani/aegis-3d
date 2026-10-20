import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Eye, Bell, X, Shield, RefreshCw } from 'lucide-react';
import { audioService } from '../../engine/audioService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [soundEnabled, setSoundEnabled] = useState(!audioService.getMuted());
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [highDpi, setHighDpi] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const toggleSound = () => {
    const next = audioService.toggleMute();
    setSoundEnabled(!next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-industrial-900 border border-industrial-800 rounded-lg max-w-md w-full shadow-2xl p-6 font-mono select-none">
        <div className="flex items-center justify-between pb-3 border-b border-industrial-800">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Settings className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wider uppercase">Simulation Settings</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          {/* Audio Setting */}
          <div className="flex items-center justify-between p-3 rounded bg-industrial-950 border border-industrial-800">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>Industrial Audio Synthesis</span>
              </div>
              <p className="text-[11px] text-slate-400">Procedural siren tones for Stage 2 alarms and clicks</p>
            </div>
            <button
              onClick={toggleSound}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${soundEnabled ? 'bg-cyan-500' : 'bg-industrial-800'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-industrial-950 transition-transform ${soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Visual Fidelity Setting */}
          <div className="flex items-center justify-between p-3 rounded bg-industrial-950 border border-industrial-800">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>3D Hazard Particles & Fog</span>
              </div>
              <p className="text-[11px] text-slate-400">Simulated smoke billows and ceiling strobe beacons</p>
            </div>
            <button
              onClick={() => setParticlesEnabled(!particlesEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${particlesEnabled ? 'bg-cyan-500' : 'bg-industrial-800'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-industrial-950 transition-transform ${particlesEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* High DPI Renderer */}
          <div className="flex items-center justify-between p-3 rounded bg-industrial-950 border border-industrial-800">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>High Performance WebGL</span>
              </div>
              <p className="text-[11px] text-slate-400">Anti-aliasing and soft shadows</p>
            </div>
            <button
              onClick={() => setHighDpi(!highDpi)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${highDpi ? 'bg-cyan-500' : 'bg-industrial-800'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-industrial-950 transition-transform ${highDpi ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-industrial-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-industrial-950 font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
