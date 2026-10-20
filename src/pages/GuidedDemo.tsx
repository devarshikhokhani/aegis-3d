import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Boxes, 
  AlertOctagon, 
  Search, 
  Split, 
  BarChart3,
  Flame,
  Cpu
} from 'lucide-react';
import { simulationStore } from '../engine/simulationStore';

interface DemoStep {
  stepNumber: number;
  title: string;
  shortDescription: string;
  detailedInstruction: string;
  digitalLogicConcept: string;
  actionText: string;
  targetRoute: string;
  autoAction?: () => void;
}

export const GuidedDemo: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);

  const steps: DemoStep[] = [
    {
      stepNumber: 1,
      title: 'Initialize Command Centre Baseline',
      shortDescription: 'Review the facility status indicators and nominal operational baseline.',
      detailedInstruction: 'Observe that all 6 zones are monitored, controller is in NORMAL state, and all gates report zero hazard confluence.',
      digitalLogicConcept: 'Combinational baseline: all sensor inputs LOW (0). System enable line EN = 1.',
      actionText: 'View Command Centre',
      targetRoute: '/',
      autoAction: () => simulationStore.resetSimulation(),
    },
    {
      stepNumber: 2,
      title: 'Enter 3D Industrial Facility',
      shortDescription: 'Explore the 3D digital twin of the factory.',
      detailedInstruction: 'Navigate to the full 3D interactive view. Orbit the camera, examine structural columns, overhead gantry rails, and equipment.',
      digitalLogicConcept: 'Physical spatial digital twin mapped 1-to-1 with telemetry address lines.',
      actionText: 'Open 3D Facility',
      targetRoute: '/facility',
    },
    {
      stepNumber: 3,
      title: 'Select Chemical & Materials Storage',
      shortDescription: 'Focus on Zone 3 (SEC-03).',
      detailedInstruction: 'Select the Storage Area rack bay to open the live telemetry drawer on the right side.',
      digitalLogicConcept: 'Multiplexer 8-to-1 channel selection (Address 010 selected).',
      actionText: 'Focus Storage Area',
      targetRoute: '/facility',
      autoAction: () => simulationStore.selectZone('ZONE_STORAGE'),
    },
    {
      stepNumber: 4,
      title: 'Inspect Analog Comparator Thresholds',
      shortDescription: 'Examine the Schmitt trigger analog-to-digital boundaries.',
      detailedInstruction: 'Look at the live dials for smoke (25% threshold), temperature (60°C threshold), and pressure window.',
      digitalLogicConcept: '2-bit magnitude comparator with Schmitt trigger hysteresis to eliminate noise jitter.',
      actionText: 'Inspect Sensors',
      targetRoute: '/facility',
    },
    {
      stepNumber: 5,
      title: 'Inject Pre-Alarm Smoke Condition',
      shortDescription: 'Raise the smoke level in Storage to 35%.',
      detailedInstruction: 'Notice how the smoke comparator trips to digital S=1, but the controller only enters Stage 1 WARNING because high temperature is still 0.',
      digitalLogicConcept: 'Primary gate evaluated: A = 1 ∧ (0 ∨ 0) = 0. Inhibits evacuation false alarm.',
      actionText: 'Inject Smoke (35%)',
      targetRoute: '/facility',
      autoAction: () => {
        simulationStore.selectZone('ZONE_STORAGE');
        simulationStore.setAnalogLevel('ZONE_STORAGE', 'smokeLevel', 35.0);
      },
    },
    {
      stepNumber: 6,
      title: 'Execute Full Critical Confluence Scenario',
      shortDescription: 'Elevate temperature to 78°C simultaneously.',
      detailedInstruction: 'Now both S=1 and H=1 are active! The primary control rule trips $A = S \land (H \lor M) = 1$.',
      digitalLogicConcept: 'Critical dual hazard confluence: A = 1 ∧ (1 ∨ 0) = 1. Priority encoder latches Channel 2.',
      actionText: 'Inject Thermal Spike (78°C)',
      targetRoute: '/facility',
      autoAction: () => {
        simulationStore.selectZone('ZONE_STORAGE');
        simulationStore.setAnalogLevel('ZONE_STORAGE', 'temperature', 78.0);
      },
    },
    {
      stepNumber: 7,
      title: 'Observe 3D Facility React in Real Time',
      shortDescription: 'Witness simulated smoke particles and emergency red strobes.',
      detailedInstruction: 'The 3D Storage Area highlights red, simulated smoke particles billow upward, ceiling sirens pulse, and egress doors unlock.',
      digitalLogicConcept: 'State-driven 3D rendering responding directly to internal Boolean output registers.',
      actionText: 'Inspect 3D Scene',
      targetRoute: '/facility',
    },
    {
      stepNumber: 8,
      title: 'Open Active Incident Management',
      shortDescription: 'Review the logged incident in the incident response lifecycle queue.',
      detailedInstruction: 'Navigate to Incident Management. Observe that the incident has been formally recorded with severity CRITICAL.',
      digitalLogicConcept: 'Finite state machine transition to ALARM_STAGE_2 with timestamped audit trail.',
      actionText: 'Open Incident Queue',
      targetRoute: '/incidents',
    },
    {
      stepNumber: 9,
      title: 'Acknowledge Alert & Inspect Logic',
      shortDescription: 'Operator acknowledges simulated klaxon and verifies logic rules.',
      detailedInstruction: 'Click "Acknowledge" to simulate operator verification. Klaxon warble is silenced, and the event is timestamped.',
      digitalLogicConcept: 'Sequential operator acknowledgement signal latched into controller state.',
      actionText: 'Acknowledge Alert',
      targetRoute: '/incidents',
      autoAction: () => {
        const inc = simulationStore.getState().incidents[0];
        if (inc) simulationStore.acknowledgeIncident(inc.id);
      },
    },
    {
      stepNumber: 10,
      title: 'Replay Incident in Investigation Centre',
      shortDescription: 'Step through historical state frames with the time-travel scrubber.',
      detailedInstruction: 'Move the scrubber backward to see the exact moment the comparator tripped from 0 to 1 before the thermal confluence.',
      digitalLogicConcept: 'Sequential state inspection: decomposing sub-expressions step by step.',
      actionText: 'Open Investigation Replay',
      targetRoute: '/investigation',
    },
    {
      stepNumber: 11,
      title: 'Simulate What-If Alternative',
      shortDescription: 'Compare Scenario A vs Scenario B side-by-side.',
      detailedInstruction: 'Toggle inputs in Scenario B to observe what would happen if the thermal sensor were inhibited.',
      digitalLogicConcept: 'Boolean variance verification and hardware fault injection (stuck-at bits).',
      actionText: 'Launch What-If Analysis',
      targetRoute: '/what-if',
    },
    {
      stepNumber: 12,
      title: 'Inspect Dynamic Evacuation Route',
      shortDescription: 'Verify Dijkstra shortest path routing around the active fire.',
      detailedInstruction: 'Check how the pathfinder avoids the Storage Area corridor and safely directs occupants to Exit B.',
      digitalLogicConcept: 'Graph-based dynamic pathfinding with active hazard node exclusion.',
      actionText: 'View Evacuation Route',
      targetRoute: '/resources',
    },
    {
      stepNumber: 13,
      title: 'Generate Audit Report & Export Dossier',
      shortDescription: 'View the final forensic report and export telemetry JSON.',
      detailedInstruction: 'Review aggregated analytics, MTTR, and print-ready forensic incident dossier derived from the actual simulation.',
      digitalLogicConcept: 'Complete verification cycle: Detect ➔ Analyse ➔ Respond.',
      actionText: 'View Reports & Analytics',
      targetRoute: '/reports',
    },
  ];

  const currentStepData = steps[currentStep - 1];

  const handleNext = () => {
    if (currentStepData.autoAction) {
      currentStepData.autoAction();
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExecuteAndNavigate = () => {
    if (currentStepData.autoAction) {
      currentStepData.autoAction();
    }
    navigate(currentStepData.targetRoute);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto select-none font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase">
              Guided Demonstration Walkthrough
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              13-STEP INTERACTIVE TOUR
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete end-to-end evaluation tour showcasing genuine 3D responses, digital electronics logic verification, and incident management.
          </p>
        </div>

        <button
          onClick={() => {
            simulationStore.resetSimulation();
            setCurrentStep(1);
          }}
          className="px-3 py-1.5 rounded bg-industrial-900 hover:bg-industrial-850 border border-industrial-700 text-slate-300 text-xs flex items-center space-x-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Walkthrough</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Step {currentStep} of {steps.length}</span>
          <span className="text-cyan-neon font-bold">{Math.round((currentStep / steps.length) * 100)}% Complete</span>
        </div>
        <div className="w-full h-2 bg-industrial-900 rounded-full overflow-hidden border border-industrial-800">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Tour Card */}
      <div className="bg-industrial-900 border border-cyan-500/40 rounded-lg p-6 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-cyan-neon tracking-widest uppercase">
              PHASE {currentStep}: TOUR STEP
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              {currentStepData.title}
            </h2>
            <p className="text-xs text-slate-300 font-sans">
              {currentStepData.shortDescription}
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shrink-0">
            {currentStep}
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="p-4 rounded-lg bg-industrial-950 border border-industrial-800 space-y-3 text-xs leading-relaxed">
          <div>
            <span className="text-slate-400 font-bold block mb-1">What to observe:</span>
            <p className="text-slate-300 font-sans">{currentStepData.detailedInstruction}</p>
          </div>

          <div className="pt-2 border-t border-industrial-850 flex items-start space-x-2 text-cyan-300">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-mono">Digital Electronics Logic: </strong>
              <span className="font-sans text-[11px]">{currentStepData.digitalLogicConcept}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-industrial-800">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-3 py-2 rounded bg-industrial-850 hover:bg-industrial-800 border border-industrial-700 text-slate-300 text-xs flex items-center space-x-1.5 disabled:opacity-40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExecuteAndNavigate}
              className="px-4 py-2 rounded bg-industrial-800 hover:bg-industrial-750 border border-cyan-500/50 text-cyan-300 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <span>{currentStepData.actionText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-industrial-950 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-lg shadow-cyan-500/20"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-industrial-950 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finish Demonstration</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
