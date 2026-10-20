import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Boxes, 
  PlayCircle, 
  Search, 
  RotateCcw, 
  ArrowUpRight,
  ChevronRight,
  Flame,
  Radio,
  SlidersHorizontal
} from 'lucide-react';
import { SimulationState, simulationStore } from '../engine/simulationStore';
import { FSMStateBadge, SeverityBadge } from '../components/shared/StatusBadge';
import { FacilityCanvas } from '../components/3d/FacilityCanvas';
import { PRESET_SCENARIOS, scenarioEngine } from '../engine/scenarios';
import { ZoneId } from '../types/simulation';

export const CommandCenter: React.FC = () => {
  const { simState } = useOutletContext<{ simState: SimulationState }>();
  const navigate = useNavigate();

  const activeIncidents = simState.incidents.filter(i => !i.resolved);
  const emergencyZones = Object.values(simState.zones).filter(z => z.status === 'EMERGENCY');
  const warningZones = Object.values(simState.zones).filter(z => z.status === 'WARNING');
  const latestIncident = simState.incidents[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Banner / Welcome & Quick Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase">
              Command Centre Overview
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              DIGITAL TWIN LIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time digital twin monitoring, telemetry logic processing, and automated emergency control.
          </p>
        </div>

        {/* Quick Mode Status */}
        <div className="flex items-center space-x-3">
          <div className="bg-industrial-900 border border-industrial-800 px-3 py-1.5 rounded flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">CONTROLLER FSM:</span>
            <FSMStateBadge state={simState.fsmState} size="sm" />
          </div>
        </div>
      </div>

      {/* KPI Facility Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Overall Status */}
        <div className="bg-industrial-900 border border-industrial-800 p-3 rounded-lg shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Facility Status</div>
          <div className="text-sm font-mono font-bold mt-1 flex items-center space-x-1.5">
            {emergencyZones.length > 0 ? (
              <span className="text-red-400 flex items-center space-x-1">
                <Flame className="w-4 h-4 animate-pulse" />
                <span>EMERGENCY</span>
              </span>
            ) : warningZones.length > 0 ? (
              <span className="text-amber-400 flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>WARNING</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>ALL NOMINAL</span>
              </span>
            )}
          </div>
        </div>

        {/* Configured Zones */}
        <div className="bg-industrial-900 border border-industrial-800 p-3 rounded-lg shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Configured Zones</div>
          <div className="text-sm font-mono font-bold mt-1 text-slate-200">
            6 / 6 Monitored
          </div>
        </div>

        {/* Active Incidents */}
        <div className="bg-industrial-900 border border-industrial-800 p-3 rounded-lg shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active Incidents</div>
          <div className={`text-sm font-mono font-bold mt-1 ${activeIncidents.length > 0 ? 'text-red-400' : 'text-slate-200'}`}>
            {activeIncidents.length} Unresolved
          </div>
        </div>

        {/* Attention Zones */}
        <div className="bg-industrial-900 border border-industrial-800 p-3 rounded-lg shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Attention Needed</div>
          <div className="text-sm font-mono font-bold mt-1 text-amber-400">
            {emergencyZones.length + warningZones.length} Zones
          </div>
        </div>

        {/* Simulation Speed */}
        <div className="bg-industrial-900 border border-industrial-800 p-3 rounded-lg shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Engine Clock</div>
          <div className="text-sm font-mono font-bold mt-1 text-cyan-400 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{simState.simulationSpeed}x Speed</span>
          </div>
        </div>

        {/* Total Events */}
        <div className="bg-industrial-900 border border-industrial-800 p-3 rounded-lg shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Logged Events</div>
          <div className="text-sm font-mono font-bold mt-1 text-slate-200">
            {simState.events.length} Events
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Preview on left + Active Incidents & Controls on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Facility Preview Box (7 cols) */}
        <div className="lg:col-span-7 bg-industrial-900 border border-industrial-800 rounded-lg overflow-hidden flex flex-col h-[420px] shadow-lg">
          <div className="p-3 bg-industrial-950/80 border-b border-industrial-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Boxes className="w-4 h-4 text-cyan-neon" />
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                3D Digital Twin Preview
              </span>
            </div>
            <button
              onClick={() => navigate('/facility')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Open Full 3D Facility</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 relative">
            <FacilityCanvas
              zones={simState.zones}
              fsmState={simState.fsmState}
              selectedZoneId={simState.selectedZoneId}
              cameraPreset="OVERVIEW"
              evacuationWaypoints={simState.activeEvacuationRoute?.waypoints}
              onSelectZone={(zoneId) => simulationStore.selectZone(zoneId)}
            />

            {/* Quick Zone Jump Overlay in Preview */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="bg-industrial-950/90 border border-industrial-800 px-3 py-1.5 rounded-md pointer-events-auto flex items-center space-x-2 text-[11px] font-mono">
                <span className="text-slate-400">Selected:</span>
                <span className="text-cyan-neon font-bold">
                  {simState.selectedZoneId ? simState.zones[simState.selectedZoneId].config.name : 'None'}
                </span>
              </div>
              <button
                onClick={() => navigate('/facility')}
                className="bg-cyan-500 hover:bg-cyan-400 text-industrial-950 px-3 py-1.5 rounded-md font-mono text-xs font-bold pointer-events-auto transition-colors shadow-lg"
              >
                Inspect Zone
              </button>
            </div>
          </div>
        </div>

        {/* Active Incidents Panel (5 cols) */}
        <div className="lg:col-span-5 bg-industrial-900 border border-industrial-800 rounded-lg flex flex-col h-[420px] shadow-lg">
          <div className="p-3 bg-industrial-950/80 border-b border-industrial-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Active Incidents ({activeIncidents.length})
              </span>
            </div>
            <button
              onClick={() => navigate('/incidents')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Manage All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-3">
            {activeIncidents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <CheckCircle className="w-10 h-10 text-emerald-500/40 mb-2" />
                <p className="text-xs font-mono font-semibold text-slate-400">No Active Emergency Incidents</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  All 6 zones are operating within nominal thresholds. Launch a preset scenario below to simulate an incident.
                </p>
              </div>
            ) : (
              activeIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="bg-industrial-950 border border-industrial-800 hover:border-industrial-700 p-3 rounded-lg font-mono text-xs space-y-2 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{incident.title}</span>
                    <SeverityBadge severity={incident.severity} />
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Zone: <strong className="text-slate-200">{incident.zoneName}</strong></span>
                    <span>Status: <strong className="text-amber-400">{incident.status}</strong></span>
                  </div>

                  <div className="pt-2 border-t border-industrial-800 flex items-center justify-end space-x-2">
                    {incident.status === 'DETECTED' && (
                      <button
                        onClick={() => simulationStore.acknowledgeIncident(incident.id)}
                        className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => {
                        simulationStore.selectIncident(incident.id);
                        navigate('/investigation');
                      }}
                      className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[11px] transition-colors"
                    >
                      Investigate
                    </button>
                    <button
                      onClick={() => simulationStore.clearHazardInZone(incident.zoneId)}
                      className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] transition-colors"
                    >
                      Clear Hazard
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Quick Actions Bar + Live Event Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Launch Preset Scenarios (5 cols) */}
        <div className="lg:col-span-5 bg-industrial-900 border border-industrial-800 rounded-lg p-4 font-mono shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-industrial-800 mb-3">
            <div className="flex items-center space-x-2 text-cyan-400">
              <PlayCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Quick Scenario Launch</span>
            </div>
            <button
              onClick={() => navigate('/simulation')}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              All 12 Scenarios
            </button>
          </div>

          <div className="space-y-2">
            {PRESET_SCENARIOS.slice(0, 4).map((scenario) => (
              <div
                key={scenario.id}
                className="p-2.5 rounded bg-industrial-950 border border-industrial-800 hover:border-cyan-500/40 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-200">{scenario.title}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[280px]">
                    {scenario.expectedOutcome}
                  </div>
                </div>
                <button
                  onClick={() => scenarioEngine.runScenario(scenario)}
                  className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-[11px] shrink-0 transition-colors"
                >
                  Run
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Simulation Event Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-industrial-900 border border-industrial-800 rounded-lg p-4 font-mono shadow-sm flex flex-col h-[280px]">
          <div className="flex items-center justify-between pb-3 border-b border-industrial-800 mb-2">
            <div className="flex items-center space-x-2 text-slate-200">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Live Event Stream</span>
            </div>
            <span className="text-[10px] text-slate-500">Auto-updating telemetry</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {simState.events.slice(0, 15).map((evt) => (
              <div
                key={evt.id}
                className="p-2 rounded bg-industrial-950/80 border border-industrial-800/80 flex items-start space-x-2.5"
              >
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  evt.severity === 'CRITICAL' ? 'bg-red-400' :
                  evt.severity === 'WARNING' ? 'bg-amber-400' : 'bg-cyan-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-200 truncate">{evt.title}</span>
                    <span className="text-[10px] text-slate-500">T+{evt.timestamp}s</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{evt.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
