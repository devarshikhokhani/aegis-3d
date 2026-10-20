import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Split, 
  Play, 
  RotateCcw, 
  Bug, 
  AlertTriangle, 
  CheckCircle, 
  Cpu, 
  Sliders, 
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { SimulationState, simulationStore, INITIAL_ZONE_CONFIGS } from '../engine/simulationStore';
import { ZoneId } from '../types/simulation';
import { evaluatePrimaryAlarmRule } from '../logic/gates';

interface ComparisonRun {
  name: string;
  smoke: boolean;
  smokeLevel: number;
  tempHigh: boolean;
  temperature: number;
  pressureAnomaly: boolean;
  manualEmergency: boolean;
  systemEnable: boolean;
  faultInjected: string;
  calculatedAlarmStage2: boolean;
  fsmStateOutcome: string;
  evacuationTriggered: boolean;
}

export const WhatIfAnalysis: React.FC = () => {
  const { simState } = useOutletContext<{ simState: SimulationState }>();

  // Run A Configuration (Baseline)
  const [runA, setRunA] = useState<ComparisonRun>({
    name: 'Condition A (Single Warning)',
    smoke: true,
    smokeLevel: 35.0,
    tempHigh: false,
    temperature: 24.0,
    pressureAnomaly: false,
    manualEmergency: false,
    systemEnable: true,
    faultInjected: 'NONE',
    calculatedAlarmStage2: false,
    fsmStateOutcome: 'WARNING',
    evacuationTriggered: false,
  });

  // Run B Configuration (What-If Alternative)
  const [runB, setRunB] = useState<ComparisonRun>({
    name: 'Condition B (Heat Confluence Added)',
    smoke: true,
    smokeLevel: 42.0,
    tempHigh: true,
    temperature: 78.0,
    pressureAnomaly: false,
    manualEmergency: false,
    systemEnable: true,
    faultInjected: 'NONE',
    calculatedAlarmStage2: true,
    fsmStateOutcome: 'ALARM_STAGE_2',
    evacuationTriggered: true,
  });

  // Fault Injection Studio State
  const [faultZone, setFaultZone] = useState<ZoneId>('ZONE_POWER');
  const [faultType, setFaultType] = useState<'NONE' | 'STUCK_0' | 'STUCK_1' | 'PARITY_ERROR' | 'ANALOG_DRIFT'>('PARITY_ERROR');
  const [faultSensor, setFaultSensor] = useState<'smoke' | 'tempHigh' | 'pressureAnomaly' | 'manualEmergency'>('smoke');

  const updateRunBField = (key: keyof ComparisonRun, value: any) => {
    const updated = { ...runB, [key]: value };
    // Re-evaluate logic
    const evalResult = evaluatePrimaryAlarmRule(updated.smoke, updated.tempHigh, updated.manualEmergency);
    updated.calculatedAlarmStage2 = evalResult.alarmOutput || updated.manualEmergency;
    updated.fsmStateOutcome = updated.calculatedAlarmStage2 ? 'ALARM_STAGE_2' : (updated.smoke || updated.tempHigh ? 'WARNING' : 'NORMAL');
    updated.evacuationTriggered = updated.calculatedAlarmStage2;
    setRunB(updated);
  };

  const handleApplyFault = () => {
    simulationStore.setFaultInjection({
      zoneId: faultZone,
      faultType,
      affectedSensor: faultSensor,
    });
  };

  const handleClearFaults = () => {
    simulationStore.setFaultInjection({
      zoneId: null,
      faultType: 'NONE',
      affectedSensor: 'smoke',
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-mono">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase">
              What-If Comparative Analysis & Fault Injection
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              SIDE-BY-SIDE DIFF
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare alternative operating conditions and inject digital hardware faults (stuck-at bits, parity errors).
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario A Card */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-industrial-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Scenario Run A (Baseline)
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-industrial-950 border border-industrial-800 text-slate-400">
              Reference Condition
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-industrial-950 border border-industrial-800 flex justify-between items-center">
              <span className="text-slate-400">Smoke (S):</span>
              <span className="font-bold text-slate-200">{runA.smoke ? 'ACTIVE (35%)' : 'CLEAR'}</span>
            </div>
            <div className="p-2.5 rounded bg-industrial-950 border border-industrial-800 flex justify-between items-center">
              <span className="text-slate-400">High Temp (H):</span>
              <span className="font-bold text-slate-400">{runA.tempHigh ? 'ACTIVE (78°C)' : 'LOW (24°C)'}</span>
            </div>
            <div className="p-2.5 rounded bg-industrial-950 border border-industrial-800 flex justify-between items-center">
              <span className="text-slate-400">Manual Pull (M):</span>
              <span className="font-bold text-slate-400">{runA.manualEmergency ? 'PULLED (1)' : 'NORMAL (0)'}</span>
            </div>
            <div className="p-2.5 rounded bg-industrial-950 border border-industrial-800 flex justify-between items-center">
              <span className="text-slate-400">Safety Enable (EN):</span>
              <span className="font-bold text-cyan-400">ARMED (1)</span>
            </div>
          </div>

          {/* Outcome A */}
          <div className="p-3 rounded bg-industrial-950/80 border border-industrial-800 space-y-1.5 text-xs">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Calculated Outcome A:</div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Stage 2 Klaxon:</span>
              <span className="text-emerald-400 font-bold">INHIBITED (0)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">FSM State:</span>
              <span className="text-amber-400 font-bold">WARNING</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Evacuation:</span>
              <span className="text-slate-400">Not Triggered</span>
            </div>
          </div>
        </div>

        {/* Scenario B Card (Interactive What-If) */}
        <div className="bg-industrial-900 border border-cyan-500/50 rounded-lg p-5 space-y-4 shadow-lg shadow-cyan-500/5">
          <div className="flex items-center justify-between pb-2 border-b border-industrial-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-neon animate-ping" />
              <h2 className="text-xs font-bold text-cyan-neon uppercase tracking-wider">
                Scenario Run B (What-If Variant)
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              Interactive Test
            </span>
          </div>

          {/* Interactive Variant Inputs */}
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-industrial-950 border border-industrial-800 flex justify-between items-center">
              <span className="text-slate-400">Smoke (S):</span>
              <button
                onClick={() => updateRunBField('smoke', !runB.smoke)}
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                  runB.smoke ? 'bg-red-500 text-industrial-950' : 'bg-industrial-800 text-slate-400'
                }`}
              >
                {runB.smoke ? 'ACTIVE (1)' : 'CLEAR (0)'}
              </button>
            </div>

            <div className="p-2.5 rounded bg-industrial-950 border border-industrial-800 flex justify-between items-center">
              <span className="text-slate-400">High Temp (H):</span>
              <button
                onClick={() => updateRunBField('tempHigh', !runB.tempHigh)}
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                  runB.tempHigh ? 'bg-amber-500 text-industrial-950' : 'bg-industrial-800 text-slate-400'
                }`}
              >
                {runB.tempHigh ? 'ACTIVE (1)' : 'LOW (0)'}
              </button>
            </div>

            <div className="p-2.5 rounded bg-industrial-950 border border-industrial-800 flex justify-between items-center">
              <span className="text-slate-400">Manual Pull (M):</span>
              <button
                onClick={() => updateRunBField('manualEmergency', !runB.manualEmergency)}
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                  runB.manualEmergency ? 'bg-red-500 text-industrial-950' : 'bg-industrial-800 text-slate-400'
                }`}
              >
                {runB.manualEmergency ? 'PULLED (1)' : 'NORMAL (0)'}
              </button>
            </div>

            <div className="p-2.5 rounded bg-industrial-950 border border-industrial-800 flex justify-between items-center">
              <span className="text-slate-400">Safety Enable (EN):</span>
              <button
                onClick={() => updateRunBField('systemEnable', !runB.systemEnable)}
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                  runB.systemEnable ? 'bg-cyan-500 text-industrial-950' : 'bg-industrial-800 text-slate-400'
                }`}
              >
                {runB.systemEnable ? 'ARMED (1)' : 'BYPASS (0)'}
              </button>
            </div>
          </div>

          {/* Outcome B */}
          <div className="p-3 rounded bg-industrial-950/80 border border-industrial-800 space-y-1.5 text-xs">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Calculated Outcome B:</div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Stage 2 Klaxon:</span>
              <span className={runB.calculatedAlarmStage2 ? 'text-red-400 font-bold animate-pulse' : 'text-emerald-400 font-bold'}>
                {runB.calculatedAlarmStage2 ? 'ACTIVE (1)' : 'INHIBITED (0)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">FSM State:</span>
              <span className={runB.fsmStateOutcome === 'ALARM_STAGE_2' ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                {runB.fsmStateOutcome}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Evacuation:</span>
              <span className={runB.evacuationTriggered ? 'text-red-400 font-bold' : 'text-slate-400'}>
                {runB.evacuationTriggered ? 'Mandatory Full Evacuation' : 'Not Triggered'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Difference Comparison Table */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-4 space-y-3 shadow-md">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-industrial-800 flex items-center space-x-1.5">
          <Split className="w-4 h-4 text-cyan-400" />
          <span>Calculated Variance & Critical Diffs</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-industrial-800 rounded">
            <thead className="bg-industrial-950 text-slate-400 border-b border-industrial-800">
              <tr>
                <th className="p-2.5">Parameter</th>
                <th className="p-2.5">Scenario A</th>
                <th className="p-2.5">Scenario B</th>
                <th className="p-2.5">Variance Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800">
              <tr>
                <td className="p-2.5 text-slate-300 font-semibold">Formula Evaluation</td>
                <td className="p-2.5 text-slate-400">1 ∧ (0 ∨ 0) = 0</td>
                <td className="p-2.5 text-slate-200">
                  {runB.smoke ? '1' : '0'} ∧ ({runB.tempHigh ? '1' : '0'} ∨ {runB.manualEmergency ? '1' : '0'}) = {runB.calculatedAlarmStage2 ? '1' : '0'}
                </td>
                <td className="p-2.5 font-bold text-cyan-400">
                  {runA.calculatedAlarmStage2 !== runB.calculatedAlarmStage2 ? 'CRITICAL STATE ESCALATION' : 'No State Change'}
                </td>
              </tr>
              <tr>
                <td className="p-2.5 text-slate-300 font-semibold">Evacuation Route Status</td>
                <td className="p-2.5 text-slate-400">Clear Walkways</td>
                <td className="p-2.5 text-slate-200">
                  {runB.evacuationTriggered ? 'Zone Hazard Block Reroute Engaged' : 'Normal Walkway'}
                </td>
                <td className="p-2.5 font-bold text-amber-400">
                  {runB.evacuationTriggered ? 'Dynamic Egress Reroute Triggered' : 'Nominal'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Fault Injection Laboratory Section */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-industrial-800">
          <div className="flex items-center space-x-2 text-purple-400">
            <Bug className="w-4 h-4" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Hardware Fault-Injection Laboratory
            </h2>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Active: {simState.faultInjection.faultType}
          </span>
        </div>

        <p className="text-xs text-slate-400 font-sans">
          Simulate electronic hardware faults such as stuck digital gate inputs, fieldbus EMI parity corruption, and sensor analog voltage drift.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1 text-xs">
            <label className="text-slate-400">Target Facility Zone:</label>
            <select
              value={faultZone}
              onChange={(e) => setFaultZone(e.target.value as ZoneId)}
              className="w-full bg-industrial-950 border border-industrial-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              {(Object.keys(INITIAL_ZONE_CONFIGS) as ZoneId[]).map((zid) => (
                <option key={zid} value={zid}>{INITIAL_ZONE_CONFIGS[zid].name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-400">Fault Archetype:</label>
            <select
              value={faultType}
              onChange={(e) => setFaultType(e.target.value as any)}
              className="w-full bg-industrial-950 border border-industrial-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="PARITY_ERROR">Corrupted Diagnostic Parity Bit (EMI Noise)</option>
              <option value="STUCK_0">Digital Line Stuck-at-0 (Ground Short)</option>
              <option value="STUCK_1">Digital Line Stuck-at-1 (VCC Short)</option>
              <option value="ANALOG_DRIFT">Sensor Voltage Drift (+Drift)</option>
            </select>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-400">Affected Sensor Line:</label>
            <select
              value={faultSensor}
              onChange={(e) => setFaultSensor(e.target.value as any)}
              className="w-full bg-industrial-950 border border-industrial-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="smoke">Smoke Sensor (S)</option>
              <option value="tempHigh">Temperature Sensor (H)</option>
              <option value="pressureAnomaly">Pressure Vessel Line (P)</option>
              <option value="manualEmergency">Manual Pull Station Line (M)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={handleClearFaults}
            className="px-3 py-1.5 rounded bg-industrial-850 hover:bg-industrial-800 border border-industrial-700 text-slate-300 text-xs transition-colors"
          >
            Clear Injected Faults
          </button>
          <button
            onClick={handleApplyFault}
            className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-lg shadow-purple-600/30"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Inject Fault into Live Twin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
