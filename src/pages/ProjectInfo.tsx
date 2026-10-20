import React from 'react';
import { 
  Cpu, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle, 
  Code, 
  Layers, 
  AlertTriangle,
  GraduationCap
} from 'lucide-react';

export const ProjectInfo: React.FC = () => {
  const deConcepts = [
    {
      concept: 'Combinational Logic Gates & Boolean Algebra',
      chips: '74HC08 (AND), 74HC32 (OR), 74HC04 (NOT)',
      implementation: 'Evaluates the primary industrial safety rule: A = S ∧ (H ∨ M). Proves Boolean simplification via the Distributive Law: S(H + M) === SH + SM. Verified across all 8 truth-table input combinations.',
    },
    {
      concept: 'Digital Comparators & Schmitt Trigger Hysteresis',
      chips: 'LM393 / 74HC85 4-Bit Magnitude Comparator',
      implementation: 'Converts continuous analog telemetry (% smoke obscuration, temperature in °C, pneumatic pressure in PSI) into noise-immune discrete Boolean signals (S, H, P) using hysteresis to prevent jitter around trip thresholds.',
    },
    {
      concept: '8-to-1 Multiplexer & 1-to-8 Demultiplexer',
      chips: '74HC151 (8-Input MUX), 74HC138 (3-to-8 DEMUX)',
      implementation: 'Central command processor polls individual zone telemetry lines over a shared bus using 3 address lines (S2, S1, S0). Demultiplexer routes targeted diagnostic reset pulses to individual zones.',
    },
    {
      concept: '8-to-3 Priority Encoder & Active-Group Detection',
      chips: '74HC148 8-Line Priority Encoder',
      implementation: 'When multiple zones trigger simultaneous hazards (e.g. cascading multi-zone incident), the priority encoder outputs the 3-bit binary code of the highest-severity line so the supervisory controller focuses response on the primary origin.',
    },
    {
      concept: 'Parity Generator & Diagnostic Packet Integrity',
      chips: '74HC280 9-Bit Parity Generator / Checker',
      implementation: 'Generates and verifies even parity bits across transmitted telemetry words. Simulates detection of electromagnetic interference (EMI) from high-voltage switchgear before critical logic triggers.',
    },
    {
      concept: 'Sequential Finite-State Machine (FSM) Controller',
      chips: 'D Flip-Flops (74HC74) / State Register Machine',
      implementation: 'Enforces deterministic sequential state transitions (NORMAL, MONITORING, WARNING, ALARM_STAGE_1, ALARM_STAGE_2, RECOVERY, FAULT, OVERRIDE) with strict transition guards and safety interlocks (resets rejected while physical hazards are active).',
    },
    {
      concept: 'BCD to 7-Segment Decoder',
      chips: '74HC4511 BCD to 7-Segment Latch/Decoder',
      implementation: 'Decodes numerical zone codes and timer countdown registers into 7-segment display logic lines (a through g).',
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto select-none font-mono">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase">
              Project Information & Logic Architecture
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              DIGITAL ELECTRONICS MINI-PROJECT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Documentation of Digital Electronics principles driving AEGIS 3D internal simulation logic.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-industrial-900 border border-industrial-800 text-xs text-cyan-400">
          <GraduationCap className="w-4 h-4" />
          <span>University Mini-Project</span>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-3 shadow-md">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Architecture Overview</span>
        </h2>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          AEGIS 3D is an educational software digital twin simulation. Rather than presenting Digital Electronics as isolated textbook diagrams, the syllabus concepts are implemented as the internal operational brain of an industrial emergency response platform.
        </p>
        <div className="p-3 rounded bg-industrial-950 border border-industrial-800 text-xs text-slate-400 font-sans">
          <strong className="text-cyan-neon font-mono">Core Premise: </strong>
          Every button, reading, zone status, and emergency response in this platform is governed by pure Boolean logic gates, Schmitt triggers, priority encoders, parity checks, and sequential state machines executing in real time.
        </div>
      </div>

      {/* Digital Electronics Implementation Mapping Table */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-4 shadow-md">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-industrial-800 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Digital Electronics Concept Implementation Matrix</span>
        </h2>

        <div className="space-y-3">
          {deConcepts.map((item, idx) => (
            <div key={idx} className="p-3 rounded bg-industrial-950 border border-industrial-800 space-y-1.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-slate-200">{item.concept}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-industrial-900 text-cyan-400 border border-industrial-800">
                  {item.chips}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {item.implementation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Prominent Safety & Educational Disclaimer */}
      <div className="bg-red-950/40 border border-red-900/60 rounded-lg p-5 space-y-2 text-xs">
        <div className="flex items-center space-x-2 text-red-400 font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>Official Simulation Disclaimer</span>
        </div>
        <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
          AEGIS is an educational software simulation designed for university Digital Electronics coursework. It is not a certified safety-instrumented system (SIS), does not interface with physical industrial sensors, does not actuate real equipment, and does not contact emergency services. All incidents, readings, alarms, and response workflows are strictly simulated.
        </p>
      </div>
    </div>
  );
};
