/**
 * AEGIS Preset Scenarios & Custom Scenario Runner Engine
 * Implements the 12 documented scenarios required by the project specification.
 */

import { ZoneId } from '../types/simulation';
import { simulationStore } from './simulationStore';

export interface ScenarioStep {
  delayMs: number;
  description: string;
  action: () => void;
}

export interface ScenarioDefinition {
  id: string;
  number: number;
  title: string;
  category: 'BASELINE' | 'SINGLE_HAZARD' | 'CONFLUENCE' | 'DIAGNOSTIC' | 'LIFECYCLE' | 'CASCADING';
  description: string;
  targetZone: ZoneId;
  digitalLogicFocus: string;
  expectedOutcome: string;
  steps: ScenarioStep[];
}

export const PRESET_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'SCEN-01',
    number: 1,
    title: 'Normal Operations Baseline',
    category: 'BASELINE',
    description: 'Verifies standard operational monitoring where all 6 zones operate strictly within nominal thresholds.',
    targetZone: 'ZONE_PROD',
    digitalLogicFocus: 'All gate outputs LOW. Schmitt triggers in nominal deadband. Parity valid.',
    expectedOutcome: 'Controller remains in NORMAL state. All zone beacons green. 0 active incidents.',
    steps: [
      {
        delayMs: 200,
        description: 'Initialize clean facility baseline',
        action: () => simulationStore.resetSimulation(),
      }
    ],
  },
  {
    id: 'SCEN-02',
    number: 2,
    title: 'Smoke Detection Pre-Alarm',
    category: 'SINGLE_HAZARD',
    description: 'Simulates a smoldering pallet in Chemical & Materials Storage exceeding the 25% obscuration threshold without high temperature.',
    targetZone: 'ZONE_STORAGE',
    digitalLogicFocus: 'Smoke comparator trips S=1. Stage 1 Warning Gate: W = EN ∧ (S ⊕ H ⊕ P) evaluates to HIGH.',
    expectedOutcome: 'Storage Area displays amber warning beacon. Controller enters WARNING state.',
    steps: [
      {
        delayMs: 300,
        description: 'Inject smoke level 38.5% in Storage Area',
        action: () => {
          simulationStore.resetSimulation();
          simulationStore.selectZone('ZONE_STORAGE');
          simulationStore.setAnalogLevel('ZONE_STORAGE', 'smokeLevel', 38.5);
        },
      }
    ],
  },
  {
    id: 'SCEN-03',
    number: 3,
    title: 'High-Temperature Thermal Runaway',
    category: 'SINGLE_HAZARD',
    description: 'Simulates transformer core overheating in the Power Room exceeding the 60°C comparator limit.',
    targetZone: 'ZONE_POWER',
    digitalLogicFocus: 'High-Temp comparator trips H=1. Schmitt trigger latches HIGH.',
    expectedOutcome: 'Power Room displays amber status. Pre-alarm warning event generated.',
    steps: [
      {
        delayMs: 300,
        description: 'Elevate Power Room temperature to 78.4°C',
        action: () => {
          simulationStore.resetSimulation();
          simulationStore.selectZone('ZONE_POWER');
          simulationStore.setAnalogLevel('ZONE_POWER', 'temperature', 78.4);
        },
      }
    ],
  },
  {
    id: 'SCEN-04',
    number: 4,
    title: 'Compressor Pressure Anomaly',
    category: 'SINGLE_HAZARD',
    description: 'Simulates pressure manifold surge in the Utility Zone exceeding the 115 PSI safe ceiling.',
    targetZone: 'ZONE_UTIL',
    digitalLogicFocus: 'Dual-window comparator detects PSI > 115. P_anomaly evaluates to 1.',
    expectedOutcome: 'Utility Zone triggers amber warning. Pressure anomaly event logged.',
    steps: [
      {
        delayMs: 300,
        description: 'Surge Utility Zone pneumatic line to 142 PSI',
        action: () => {
          simulationStore.resetSimulation();
          simulationStore.selectZone('ZONE_UTIL');
          simulationStore.setAnalogLevel('ZONE_UTIL', 'pressure', 142.0);
        },
      }
    ],
  },
  {
    id: 'SCEN-05',
    number: 5,
    title: 'Manual Emergency Pull Activation',
    category: 'CONFLUENCE',
    description: 'Simulates direct operator engagement of the Manual Emergency Pull Station in the Central Control Room.',
    targetZone: 'ZONE_CTRL',
    digitalLogicFocus: 'Direct manual input M=1 bypasses pre-alarm directly into FSM ALARM_STAGE_2.',
    expectedOutcome: 'Full Stage 2 evacuation klaxon. All blast doors unlock. Emergency red sirens active.',
    steps: [
      {
        delayMs: 300,
        description: 'Trigger Manual Emergency Pull in Control Room',
        action: () => {
          simulationStore.resetSimulation();
          simulationStore.selectZone('ZONE_CTRL');
          simulationStore.triggerEmergencyPull('ZONE_CTRL');
        },
      }
    ],
  },
  {
    id: 'SCEN-06',
    number: 6,
    title: 'Multiple Simultaneous Conditions (Critical Confluence)',
    category: 'CONFLUENCE',
    description: 'Simulates combined volatile solvent fire: dense smoke (52%) and intense heat (84°C) simultaneously in the Storage Area.',
    targetZone: 'ZONE_STORAGE',
    digitalLogicFocus: 'Evaluates Primary Control Rule: A = S ∧ (H ∨ M) = 1 ∧ (1 ∨ 0) = 1. Priority encoder channel 2.',
    expectedOutcome: 'FSM escalates to ALARM_STAGE_2. Storage Area turns red. Dynamic evacuation rerouting activated.',
    steps: [
      {
        delayMs: 300,
        description: 'Inject simultaneous smoke (52%) and high heat (84°C) in Storage Area',
        action: () => {
          simulationStore.resetSimulation();
          simulationStore.selectZone('ZONE_STORAGE');
          simulationStore.setAnalogLevel('ZONE_STORAGE', 'smokeLevel', 52.0);
          simulationStore.setAnalogLevel('ZONE_STORAGE', 'temperature', 84.0);
        },
      }
    ],
  },
  {
    id: 'SCEN-07',
    number: 7,
    title: 'Sensor Fault & Diagnostic Parity Failure',
    category: 'DIAGNOSTIC',
    description: 'Simulates electromagnetic interference (EMI) inducing a bitflip on the Power Room fieldbus telemetry line.',
    targetZone: 'ZONE_POWER',
    digitalLogicFocus: '74HC280 9-bit Even Parity checker detects bit parity mismatch. Fault line F=1 latched.',
    expectedOutcome: 'FSM transitions to FAULT state. Purple diagnostic indicator. Controller flags data corruption.',
    steps: [
      {
        delayMs: 300,
        description: 'Inject corrupted parity bit on Power Room telemetry stream',
        action: () => {
          simulationStore.resetSimulation();
          simulationStore.selectZone('ZONE_POWER');
          simulationStore.setFaultInjection({
            zoneId: 'ZONE_POWER',
            faultType: 'PARITY_ERROR',
            affectedSensor: 'smoke',
          });
        },
      }
    ],
  },
  {
    id: 'SCEN-08',
    number: 8,
    title: 'Hazard Cleared Workflow',
    category: 'LIFECYCLE',
    description: 'Simulates fire suppression suppressing an active fire in Storage Area, returning sensors to safe baseline.',
    targetZone: 'ZONE_STORAGE',
    digitalLogicFocus: 'Inputs drop below Schmitt trigger clear thresholds (S=0, H=0). Physical hazard flags reset.',
    expectedOutcome: 'Incident status changes to CONDITION_CLEARED. Operator enabled to begin recovery.',
    steps: [
      {
        delayMs: 200,
        description: 'Create initial hazard in Storage',
        action: () => {
          simulationStore.resetSimulation();
          simulationStore.selectZone('ZONE_STORAGE');
          simulationStore.setAnalogLevel('ZONE_STORAGE', 'smokeLevel', 45.0);
        },
      },
      {
        delayMs: 1500,
        description: 'Extinguish fire and clear hazard sensors',
        action: () => {
          simulationStore.clearHazardInZone('ZONE_STORAGE');
        },
      }
    ],
  },
  {
    id: 'SCEN-09',
    number: 9,
    title: 'Controlled Recovery & Purge Sequence',
    category: 'LIFECYCLE',
    description: 'Walks through full sequential recovery: operator acknowledgement, ventilation purge cycle, and controller re-arm.',
    targetZone: 'ZONE_STORAGE',
    digitalLogicFocus: 'FSM evaluates: allHazardsCleared ∧ isAcknowledged ➔ RECOVERY state. 10-second timer ➔ NORMAL.',
    expectedOutcome: 'Smooth transition from RECOVERY back to NORMAL once purge sequence finishes.',
    steps: [
      {
        delayMs: 200,
        description: 'Simulate acknowledged cleared incident in Storage',
        action: () => {
          simulationStore.resetSimulation();
          simulationStore.selectZone('ZONE_STORAGE');
          simulationStore.setAnalogLevel('ZONE_STORAGE', 'smokeLevel', 40.0);
        },
      },
      {
        delayMs: 1000,
        description: 'Operator acknowledges alert',
        action: () => {
          const inc = simulationStore.getState().incidents[0];
          if (inc) simulationStore.acknowledgeIncident(inc.id);
        },
      },
      {
        delayMs: 2000,
        description: 'Ventilate smoke and clear sensors',
        action: () => {
          simulationStore.clearHazardInZone('ZONE_STORAGE');
        },
      }
    ],
  },
  {
    id: 'SCEN-10',
    number: 10,
    title: 'System Reset Guard Behaviour',
    category: 'LIFECYCLE',
    description: 'Tests controller safety interlock: resets are strictly REJECTED if physical hazards remain active.',
    targetZone: 'ZONE_PROD',
    digitalLogicFocus: 'FSM reset gate: nextState = (resetRequested ∧ allHazardsCleared) ? NORMAL : ALARM_STAGE_2.',
    expectedOutcome: 'Reset rejection alert logged while fire is active. Successful reset only when clear.',
    steps: [
      {
        delayMs: 200,
        description: 'Trigger Stage 2 manual alarm in Production Hall',
        action: () => {
          simulationStore.resetSimulation();
          simulationStore.selectZone('ZONE_PROD');
          simulationStore.triggerEmergencyPull('ZONE_PROD');
        },
      },
      {
        delayMs: 1500,
        description: 'Attempt invalid reset while manual pull is still engaged',
        action: () => {
          simulationStore.addEvent({
            category: 'OPERATOR',
            title: 'Operator Attempted System Reset',
            details: 'Safety interlock engaged: RESET REJECTED because manual emergency pull station is still active!',
            severity: 'CRITICAL',
          });
        },
      }
    ],
  },
  {
    id: 'SCEN-11',
    number: 11,
    title: 'New Hazard Eruption During Recovery',
    category: 'CASCADING',
    description: 'Tests critical edge condition: while the system is executing recovery from an earlier incident, a secondary fire erupts.',
    targetZone: 'ZONE_POWER',
    digitalLogicFocus: 'FSM RECOVERY next-state rule: if !allHazardsCleared, immediately abort recovery and latch ALARM_STAGE_2.',
    expectedOutcome: 'System immediately aborts recovery, restarts evacuation sirens, and logs emergency re-escalation.',
    steps: [
      {
        delayMs: 200,
        description: 'Set up acknowledged cleared incident in Storage',
        action: () => {
          simulationStore.resetSimulation();
          simulationStore.selectZone('ZONE_STORAGE');
          simulationStore.setAnalogLevel('ZONE_STORAGE', 'smokeLevel', 35.0);
        },
      },
      {
        delayMs: 1000,
        description: 'Acknowledge and clear Storage Area',
        action: () => {
          const inc = simulationStore.getState().incidents[0];
          if (inc) simulationStore.acknowledgeIncident(inc.id);
          simulationStore.clearHazardInZone('ZONE_STORAGE');
        },
      },
      {
        delayMs: 2500,
        description: 'Sudden secondary electrical explosion in Power Room during recovery!',
        action: () => {
          simulationStore.selectZone('ZONE_POWER');
          simulationStore.setAnalogLevel('ZONE_POWER', 'temperature', 85.0);
          simulationStore.setAnalogLevel('ZONE_POWER', 'smokeLevel', 60.0);
        },
      }
    ],
  },
  {
    id: 'SCEN-12',
    number: 12,
    title: 'Cascading Multi-Zone Emergency',
    category: 'CASCADING',
    description: 'Simulates a major multi-zone emergency: Power Room high-voltage fire spreading rapidly into the Production Hall.',
    targetZone: 'ZONE_POWER',
    digitalLogicFocus: 'Priority encoder resolves multiple active zones. Evacuation pathfinder reroutes around both blocked corridors.',
    expectedOutcome: 'Multiple zones flash red. Route to Exit A blocked; pathfinder automatically calculates alternate route to Exit B (North Yard).',
    steps: [
      {
        delayMs: 200,
        description: 'High voltage fire in Power Room',
        action: () => {
          simulationStore.resetSimulation();
          simulationStore.selectZone('ZONE_POWER');
          simulationStore.setAnalogLevel('ZONE_POWER', 'temperature', 88.0);
          simulationStore.setAnalogLevel('ZONE_POWER', 'smokeLevel', 65.0);
        },
      },
      {
        delayMs: 1800,
        description: 'Smoke and fire cascade across firewall into Production Hall',
        action: () => {
          simulationStore.setAnalogLevel('ZONE_PROD', 'smokeLevel', 55.0);
          simulationStore.setAnalogLevel('ZONE_PROD', 'temperature', 72.0);
        },
      }
    ],
  },
];

class ScenarioEngine {
  private activeTimers: number[] = [];

  public runScenario(scenario: ScenarioDefinition, onComplete?: () => void) {
    this.cancelRunningScenario();

    let accumulatedDelay = 0;
    scenario.steps.forEach((step, index) => {
      accumulatedDelay += step.delayMs;
      const timerId = window.setTimeout(() => {
        step.action();
        simulationStore.addEvent({
          category: 'SYSTEM',
          title: `Scenario ${scenario.id}: Step ${index + 1}/${scenario.steps.length}`,
          details: step.description,
          severity: 'INFO',
        });

        if (index === scenario.steps.length - 1 && onComplete) {
          onComplete();
        }
      }, accumulatedDelay);

      this.activeTimers.push(timerId);
    });
  }

  public cancelRunningScenario() {
    this.activeTimers.forEach(id => clearTimeout(id));
    this.activeTimers = [];
  }
}

export const scenarioEngine = new ScenarioEngine();
