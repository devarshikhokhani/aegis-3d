import { describe, it, expect } from 'vitest';
import { 
  evaluatePrimaryAlarmRule, 
  generatePrimaryTruthTable, 
  AND, 
  OR, 
  NOT, 
  XOR, 
  NAND, 
  NOR 
} from '../logic/gates';
import { 
  evaluateComparatorWithHysteresis, 
  evaluateWindowComparator, 
  DEFAULT_THRESHOLDS 
} from '../logic/comparators';
import { 
  multiplexer8to1, 
  demultiplexer1to8 
} from '../logic/multiplexer';
import { 
  priorityEncoder8to3, 
  bcdTo7Segment 
} from '../logic/encoder';
import { 
  packageZoneTelemetry, 
  verifyTelemetryPacket 
} from '../logic/parity';
import { 
  evaluateNextFSMState, 
  FSMInputConditions 
} from '../logic/fsm';
import { 
  calculateEvacuationRoute 
} from '../logic/routing';

describe('1. Digital Electronics Core Gates & Boolean Logic', () => {
  it('implements fundamental logic gates correctly', () => {
    expect(AND(true, true)).toBe(true);
    expect(AND(true, false)).toBe(false);
    expect(OR(false, false)).toBe(false);
    expect(OR(false, true)).toBe(true);
    expect(NOT(true)).toBe(false);
    expect(XOR(true, false)).toBe(true);
    expect(XOR(true, true)).toBe(false);
    expect(NAND(true, true)).toBe(false);
    expect(NOR(false, false)).toBe(true);
  });

  it('exhaustively evaluates all 8 combinations of primary rule A = S AND (H OR M)', () => {
    const truthTable = generatePrimaryTruthTable();
    expect(truthTable).toHaveLength(8);

    // Verify each combination matches exact digital electronics Boolean specification
    truthTable.forEach(row => {
      const calculated = evaluatePrimaryAlarmRule(row.smoke, row.highTemp, row.manual);
      expect(calculated.alarmOutput).toBe(row.alarmOutput);
      // Verify distributive law equivalence: S(H + M) === SH + SM
      expect(calculated.distributiveCheck).toBe(calculated.alarmOutput);

      // Specifically check truth conditions:
      // A is 1 ONLY when S is 1 AND at least one of (H, M) is 1
      if (!row.smoke) {
        expect(row.alarmOutput).toBe(false);
      } else if (!row.highTemp && !row.manual) {
        expect(row.alarmOutput).toBe(false);
      } else {
        expect(row.alarmOutput).toBe(true);
      }
    });

    // Check row counts: 3 rows should be 1 (m5: 101, m6: 110, m7: 111), 5 rows should be 0
    const activeRows = truthTable.filter(r => r.alarmOutput);
    expect(activeRows).toHaveLength(3);
  });
});

describe('2. Digital Comparators with Schmitt Trigger Hysteresis', () => {
  it('switches state based on threshold and prevents jitter via hysteresis', () => {
    const { tempHighCelsius, tempHysteresis } = DEFAULT_THRESHOLDS; // 60, 6

    // From LOW state, 59°C should remain LOW
    expect(evaluateComparatorWithHysteresis(59, tempHighCelsius, tempHysteresis, false)).toBe(false);
    // 60°C trips to HIGH
    expect(evaluateComparatorWithHysteresis(60, tempHighCelsius, tempHysteresis, false)).toBe(true);
    // From HIGH state, 56°C should REMAIN HIGH due to hysteresis (60 - 6 = 54°C trip clear point)
    expect(evaluateComparatorWithHysteresis(56, tempHighCelsius, tempHysteresis, true)).toBe(true);
    // Below 54°C drops back to LOW
    expect(evaluateComparatorWithHysteresis(53, tempHighCelsius, tempHysteresis, true)).toBe(false);
  });

  it('window comparator detects pressure outside safe range', () => {
    // Safe band [45, 115] PSI
    expect(evaluateWindowComparator(80, 45, 115, false)).toBe(false); // safe
    expect(evaluateWindowComparator(125, 45, 115, false)).toBe(true); // high anomaly
    expect(evaluateWindowComparator(30, 45, 115, false)).toBe(true); // low vacuum anomaly
  });
});

describe('3. Multiplexer, Priority Encoder & Telemetry Parity', () => {
  it('8-to-1 MUX selects correct channel data based on S2, S1, S0', () => {
    const inputs = {
      d0: false, d1: false, d2: false, d3: true,
      d4: false, d5: false, d6: false, d7: false,
    };

    // Address 3 (S2=0, S1=1, S0=1)
    const resultCh3 = multiplexer8to1(inputs, false, true, true);
    expect(resultCh3.outputY).toBe(true);
    expect(resultCh3.outputW).toBe(false);
    expect(resultCh3.selectedChannel).toBe(3);

    // Address 2 (S2=0, S1=1, S0=0)
    const resultCh2 = multiplexer8to1(inputs, false, true, false);
    expect(resultCh2.outputY).toBe(false);
  });

  it('8-to-3 Priority Encoder reports highest index active input', () => {
    // Inputs: channels 1, 3, and 5 active simultaneously
    const lines = [false, true, false, true, false, true, false, false];
    const encoded = priorityEncoder8to3(lines);

    expect(encoded.hasActiveInput).toBe(true);
    expect(encoded.encodedCode).toBe(5); // Highest active channel is 5
    expect(encoded.a2).toBe(true); // 5 = 101 in binary
    expect(encoded.a1).toBe(false);
    expect(encoded.a0).toBe(true);
  });

  it('detects corrupted telemetry parity bits', () => {
    // Normal packet with valid even parity
    const validPacket = packageZoneTelemetry(2, true, true, false, false, true, false);
    const validCheck = verifyTelemetryPacket(validPacket);
    expect(validCheck.valid).toBe(true);

    // Injected parity error simulates line noise
    const corruptedPacket = packageZoneTelemetry(2, true, true, false, false, true, true);
    const corruptedCheck = verifyTelemetryPacket(corruptedPacket);
    expect(corruptedCheck.valid).toBe(false);
  });
});

describe('4. FSM Controller & Emergency Transitions', () => {
  const baseInputs: FSMInputConditions = {
    alarmStage2Active: false,
    warningStage1Active: false,
    manualPullActive: false,
    sensorFaultActive: false,
    allHazardsCleared: true,
    isAcknowledged: false,
    recoveryTimerCompleted: false,
    supervisorOverride: false,
    resetRequested: false,
  };

  it('transitions from NORMAL to WARNING on pre-alarm', () => {
    const res = evaluateNextFSMState('NORMAL', {
      ...baseInputs,
      warningStage1Active: true,
      allHazardsCleared: false,
    });
    expect(res.toState).toBe('WARNING');
  });

  it('escalates to ALARM_STAGE_2 on dual hazard or manual pull', () => {
    const res = evaluateNextFSMState('WARNING', {
      ...baseInputs,
      alarmStage2Active: true,
      allHazardsCleared: false,
    });
    expect(res.toState).toBe('ALARM_STAGE_2');
  });

  it('REJECTS reset if physical hazard is still active during ALARM_STAGE_2', () => {
    const res = evaluateNextFSMState('ALARM_STAGE_2', {
      ...baseInputs,
      alarmStage2Active: false,
      allHazardsCleared: false, // Fire/smoke still detected!
      resetRequested: true,
    });
    expect(res.allowed).toBe(false);
    expect(res.toState).toBe('ALARM_STAGE_2');
    expect(res.reason).toContain('RESET REJECTED');
  });

  it('enters RECOVERY only when hazard cleared and operator acknowledged', () => {
    const res = evaluateNextFSMState('ALARM_STAGE_2', {
      ...baseInputs,
      allHazardsCleared: true,
      isAcknowledged: true,
    });
    expect(res.toState).toBe('RECOVERY');
  });

  it('re-escalates to ALARM_STAGE_2 if new hazard erupts during RECOVERY', () => {
    const res = evaluateNextFSMState('RECOVERY', {
      ...baseInputs,
      allHazardsCleared: false, // New hazard!
      alarmStage2Active: true,
    });
    expect(res.toState).toBe('ALARM_STAGE_2');
    expect(res.reason).toContain('re-ignited during recovery');
  });
});

describe('5. Facility Evacuation Route Calculation', () => {
  it('finds safe route from Production Hall to nearest exit under normal conditions', () => {
    const route = calculateEvacuationRoute('ZONE_PROD', []);
    expect(route.routeFound).toBe(true);
    expect(route.waypoints.length).toBeGreaterThan(1);
    expect(route.blockedCorridors).toHaveLength(0);
  });

  it('dynamically reroutes around blocked hazard zone', () => {
    // If Central Storage and East passage is blocked by emergency in Storage
    const route = calculateEvacuationRoute('ZONE_PROD', ['ZONE_STORAGE', 'ZONE_CTRL']);
    expect(route.routeFound).toBe(true);
    // Should route via North exit or clear walkway
    expect(route.waypoints.length).toBeGreaterThan(0);
  });
});
