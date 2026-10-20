import React from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import { simulationStore } from '../../engine/simulationStore';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    simulationStore.resetSimulation();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-industrial-900 border border-industrial-800 rounded-lg max-w-md w-full shadow-2xl p-6 font-mono select-none">
        <div className="flex items-center justify-between pb-3 border-b border-industrial-800">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wider uppercase">Confirm System Reset</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            Are you sure you want to reset the AEGIS 3D industrial simulation?
          </p>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li>All active and historical incidents will be archived.</li>
            <li>All 6 facility zones will return to nominal baseline (24°C, 4% smoke, 88 PSI).</li>
            <li>Controller registers will re-arm to NORMAL operational state.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-industrial-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-industrial-850 hover:bg-industrial-800 text-slate-300 text-xs border border-industrial-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-lg shadow-red-600/30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Confirm Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
