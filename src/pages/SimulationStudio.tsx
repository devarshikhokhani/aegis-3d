import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  FlaskConical, 
  Play, 
  Plus, 
  Trash2, 
  RotateCcw, 
  CheckCircle, 
  Cpu, 
  Layers, 
  Sliders, 
  Flame, 
  Thermometer, 
  Gauge, 
  Clock,
  Sparkles
} from 'lucide-react';
import { SimulationState, simulationStore, INITIAL_ZONE_CONFIGS } from '../engine/simulationStore';
import { PRESET_SCENARIOS, ScenarioDefinition, scenarioEngine } from '../engine/scenarios';
import { ZoneId } from '../types/simulation';

interface CustomStep {
  id: string;
  delayMs: number;
  sensor: 'smokeLevel' | 'temperature' | 'pressure' | 'manualEmergency';
  value: number | boolean;
  label: string;
}

export const SimulationStudio: React.FC = () => {
  const { simState } = useOutletContext<{ simState: SimulationState }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'PRESETS' | 'CUSTOM'>('PRESETS');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [runningScenarioId, setRunningScenarioId] = useState<string | null>(null);

  // Custom Scenario Builder State
  const [customZoneId, setCustomZoneId] = useState<ZoneId>('ZONE_STORAGE');
  const [customSteps, setCustomSteps] = useState<CustomStep[]>([
    { id: '1', delayMs: 500, sensor: 'smokeLevel', value: 45.0, label: 'Elevate smoke to 45% (S=1)' },
    { id: '2', delayMs: 1500, sensor: 'temperature', value: 75.0, label: 'Spike heat to 75°C (H=1) triggering A=S∧(H∨M)' },
  ]);

  const [stepSensor, setStepSensor] = useState<'smokeLevel' | 'temperature' | 'pressure' | 'manualEmergency'>('smokeLevel');
  const [stepValue, setStepValue] = useState<number>(50);
  const [stepDelay, setStepDelay] = useState<number>(1000);

  const categories = ['ALL', 'BASELINE', 'SINGLE_HAZARD', 'CONFLUENCE', 'DIAGNOSTIC', 'LIFECYCLE', 'CASCADING'];

  const filteredPresets = PRESET_SCENARIOS.filter(s => {
    if (selectedCategory !== 'ALL' && s.category !== selectedCategory) return false;
    return true;
  });

  const handleRunPreset = (scenario: ScenarioDefinition) => {
    setRunningScenarioId(scenario.id);
    scenarioEngine.runScenario(scenario, () => {
      setRunningScenarioId(null);
    });
  };

  const handleAddCustomStep = () => {
    const newStep: CustomStep = {
      id: Date.now().toString(),
      delayMs: stepDelay,
      sensor: stepSensor,
      value: stepSensor === 'manualEmergency' ? true : stepValue,
      label: stepSensor === 'manualEmergency' 
        ? 'Trip Manual Pull Station (M=1)' 
        : `Set ${stepSensor} to ${stepValue}`,
    };
    setCustomSteps([...customSteps, newStep]);
  };

  const handleRemoveCustomStep = (id: string) => {
    setCustomSteps(customSteps.filter(s => s.id !== id));
  };

  const handleRunCustom = () => {
    simulationStore.resetSimulation();
    simulationStore.selectZone(customZoneId);

    let delay = 0;
    customSteps.forEach((step, idx) => {
      delay += step.delayMs;
      setTimeout(() => {
        if (step.sensor === 'manualEmergency') {
          simulationStore.triggerEmergencyPull(customZoneId);
        } else {
          simulationStore.setAnalogLevel(customZoneId, step.sensor, step.value as number);
        }
        simulationStore.addEvent({
          category: 'SYSTEM',
          title: `Custom Scenario Step ${idx + 1}/${customSteps.length}`,
          details: `${step.label} in ${customZoneId}`,
          severity: 'INFO',
        });
      }, delay);
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-mono">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase">
              Simulation Studio
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              12 PRESET SCENARIOS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test and benchmark digital electronics control logic through deterministic emergency scenarios.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-industrial-900 border border-industrial-800 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('PRESETS')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'PRESETS' ? 'bg-cyan-500 text-industrial-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Preset Library (12)
          </button>
          <button
            onClick={() => setActiveTab('CUSTOM')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'CUSTOM' ? 'bg-cyan-500 text-industrial-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom Scenario Builder
          </button>
        </div>
      </div>

      {activeTab === 'PRESETS' ? (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md border transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-industrial-850 border-cyan-500 text-cyan-400 font-bold' 
                    : 'bg-industrial-900 border-industrial-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Grid of Preset Scenario Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPresets.map((scen) => {
              const isRunning = runningScenarioId === scen.id;
              return (
                <div
                  key={scen.id}
                  className="bg-industrial-900 border border-industrial-800 hover:border-industrial-700 p-4 rounded-lg flex flex-col justify-between text-xs space-y-3 transition-colors shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-cyan-neon font-bold tracking-wider">
                        #{scen.number} | {scen.id}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-industrial-950 border border-industrial-800 text-slate-400">
                        {scen.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100">
                      {scen.title}
                    </h3>

                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      {scen.description}
                    </p>

                    <div className="p-2.5 rounded bg-industrial-950/80 border border-industrial-800/80 space-y-1">
                      <div className="text-[10px] text-slate-400">
                        <strong className="text-cyan-400">Logic:</strong> {scen.digitalLogicFocus}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        <strong className="text-amber-400">Expected:</strong> {scen.expectedOutcome}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-industrial-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Zone: {scen.targetZone.replace('ZONE_', '')}
                    </span>
                    <button
                      onClick={() => handleRunPreset(scen)}
                      disabled={isRunning}
                      className={`px-3 py-1.5 rounded font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md ${
                        isRunning 
                          ? 'bg-amber-500 text-industrial-950 animate-pulse' 
                          : 'bg-cyan-500 hover:bg-cyan-400 text-industrial-950'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isRunning ? 'Running...' : 'Execute'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Custom Scenario Builder */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Builder Controls (5 cols) */}
          <div className="lg:col-span-5 bg-industrial-900 border border-industrial-800 rounded-lg p-4 space-y-4">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-industrial-800 flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Configure Scenario Step</span>
            </h2>

            {/* Target Zone Selector */}
            <div className="space-y-1 text-xs">
              <label className="text-slate-400">Target Facility Zone:</label>
              <select
                value={customZoneId}
                onChange={(e) => setCustomZoneId(e.target.value as ZoneId)}
                className="w-full bg-industrial-950 border border-industrial-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
              >
                {(Object.keys(INITIAL_ZONE_CONFIGS) as ZoneId[]).map((zid) => (
                  <option key={zid} value={zid}>
                    {INITIAL_ZONE_CONFIGS[zid].name} ({zid})
                  </option>
                ))}
              </select>
            </div>

            {/* Sensor to Alter */}
            <div className="space-y-1 text-xs">
              <label className="text-slate-400">Sensor Parameter:</label>
              <select
                value={stepSensor}
                onChange={(e) => setStepSensor(e.target.value as any)}
                className="w-full bg-industrial-950 border border-industrial-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
              >
                <option value="smokeLevel">Smoke Sensor (% obscuration)</option>
                <option value="temperature">Thermal Sensor (°C)</option>
                <option value="pressure">Pressure Vessel (PSI)</option>
                <option value="manualEmergency">Manual Pull Station (Discrete M)</option>
              </select>
            </div>

            {/* Value Slider (if not manual emergency) */}
            {stepSensor !== 'manualEmergency' && (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <label className="text-slate-400">Target Value:</label>
                  <span className="font-bold text-cyan-400">
                    {stepValue} {stepSensor === 'smokeLevel' ? '%' : stepSensor === 'temperature' ? '°C' : 'PSI'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={stepSensor === 'smokeLevel' ? '100' : stepSensor === 'temperature' ? '120' : '180'}
                  value={stepValue}
                  onChange={(e) => setStepValue(parseFloat(e.target.value))}
                  className="w-full h-1 bg-industrial-800 rounded appearance-none accent-cyan-400"
                />
              </div>
            )}

            {/* Delay in milliseconds */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <label className="text-slate-400">Step Delay:</label>
                <span className="font-bold text-slate-200">{stepDelay} ms</span>
              </div>
              <input
                type="range"
                min="200"
                max="5000"
                step="100"
                value={stepDelay}
                onChange={(e) => setStepDelay(parseInt(e.target.value))}
                className="w-full h-1 bg-industrial-800 rounded appearance-none accent-cyan-400"
              />
            </div>

            <button
              onClick={handleAddCustomStep}
              className="w-full py-2 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Append Step to Sequence</span>
            </button>
          </div>

          {/* Sequence Timeline & Runner (7 cols) */}
          <div className="lg:col-span-7 bg-industrial-900 border border-industrial-800 rounded-lg p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-industrial-800">
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Configured Timeline ({customSteps.length} Steps)</span>
                </h2>
                <button
                  onClick={() => setCustomSteps([])}
                  className="text-[10px] text-red-400 hover:text-red-300"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {customSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-2.5 rounded bg-industrial-950 border border-industrial-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-industrial-850 border border-industrial-700 flex items-center justify-center text-[10px] text-cyan-400 font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-200">{step.label}</div>
                        <div className="text-[10px] text-slate-500">Delay: +{step.delayMs}ms</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCustomStep(step.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-industrial-800 flex items-center justify-end space-x-3">
              <button
                onClick={() => simulationStore.resetSimulation()}
                className="px-3 py-2 rounded bg-industrial-850 hover:bg-industrial-800 border border-industrial-700 text-slate-300 text-xs transition-colors"
              >
                Reset Facility
              </button>
              <button
                onClick={handleRunCustom}
                disabled={customSteps.length === 0}
                className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-industrial-950 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>Execute Custom Scenario</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
