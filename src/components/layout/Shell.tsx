import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DisclaimerBanner } from '../shared/DisclaimerBanner';
import { ResetModal } from './ResetModal';
import { SettingsModal } from './SettingsModal';
import { simulationStore, SimulationState } from '../../engine/simulationStore';

export const Shell: React.FC = () => {
  const [simState, setSimState] = useState<SimulationState>(simulationStore.getState());
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = simulationStore.subscribe((newState) => {
      setSimState({ ...newState });
    });
    return unsubscribe;
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070b14] text-slate-100 font-sans overflow-hidden">
      {/* Top Application Header */}
      <Header state={simState} onOpenResetModal={() => setResetModalOpen(true)} />

      {/* Main Workspace Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Navigation Sidebar */}
        <Sidebar state={simState} onOpenSettings={() => setSettingsModalOpen(true)} />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-industrial-950 relative">
          <Outlet context={{ simState }} />
        </main>
      </div>

      {/* Bottom Disclaimer & Engine Status */}
      <DisclaimerBanner />

      {/* Dialog Modals */}
      <ResetModal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} />
      <SettingsModal isOpen={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
    </div>
  );
};
