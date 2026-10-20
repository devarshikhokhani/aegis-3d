/**
 * Digital Electronics Combinational Logic Core
 * Pure TypeScript functions with no UI/React dependencies.
 */

export const NOT = (a: boolean): boolean => !a;
export const AND = (a: boolean, b: boolean): boolean => a && b;
export const AND3 = (a: boolean, b: boolean, c: boolean): boolean => a && b && c;
export const OR = (a: boolean, b: boolean): boolean => a || b;
export const OR3 = (a: boolean, b: boolean, c: boolean): boolean => a || b || c;
export const NAND = (a: boolean, b: boolean): boolean => !(a && b);
export const NOR = (a: boolean, b: boolean): boolean => !(a || b);
export const XOR = (a: boolean, b: boolean): boolean => (a && !b) || (!a && b);
export const XNOR = (a: boolean, b: boolean): boolean => !XOR(a, b);

/**
 * Primary Control Function specified in project specification:
 * A = S AND (H OR M)
 * 
 * Where:
 * S = Simulated Smoke input
 * H = High-Temperature condition
 * M = Manual emergency pull input
 * A = Simulated Alarm Stage 2 (Emergency Evacuation)
 */
export function evaluatePrimaryAlarmRule(smoke: boolean, highTemp: boolean, manualEmergency: boolean): {
  alarmOutput: boolean;
  intermediateOr: boolean;
  distributiveCheck: boolean;
  booleanExpression: string;
} {
  const intermediateOr = OR(highTemp, manualEmergency);
  const alarmOutput = AND(smoke, intermediateOr);
  
  // Distributive law verification: S AND (H OR M) === (S AND H) OR (S AND M)
  const distributiveCheck = OR(AND(smoke, highTemp), AND(smoke, manualEmergency));

  return {
    alarmOutput,
    intermediateOr,
    distributiveCheck,
    booleanExpression: `A = ${smoke ? '1' : '0'} ∧ (${highTemp ? '1' : '0'} ∨ ${manualEmergency ? '1' : '0'}) = ${alarmOutput ? '1' : '0'}`,
  };
}

/**
 * Truth table generator for the primary control function: A = S AND (H OR M)
 * Generates all 2^3 = 8 combinations with verified outputs.
 */
export interface TruthTableRow {
  smoke: boolean;
  highTemp: boolean;
  manual: boolean;
  orResult: boolean;
  alarmOutput: boolean;
  minterm: string; // e.g. "m5: S·H'·M"
}

export function generatePrimaryTruthTable(): TruthTableRow[] {
  const rows: TruthTableRow[] = [];
  
  // 8 combinations: 000 through 111
  for (let s = 0; s <= 1; s++) {
    for (let h = 0; h <= 1; h++) {
      for (let m = 0; m <= 1; m++) {
        const smoke = s === 1;
        const highTemp = h === 1;
        const manual = m === 1;
        const orResult = OR(highTemp, manual);
        const alarmOutput = AND(smoke, orResult);
        const index = (s << 2) | (h << 1) | m;
        
        const minterm = `m${index}: ${smoke ? 'S' : "S'"}·${highTemp ? 'H' : "H'"}·${manual ? 'M' : "M'"}`;
        
        rows.push({
          smoke,
          highTemp,
          manual,
          orResult,
          alarmOutput,
          minterm,
        });
      }
    }
  }
  
  return rows;
}

/**
 * Stage 1 Warning Logic (Pre-Alarm):
 * W = EN AND (S XOR H XOR P)
 * Triggered when any single hazard is active without full critical confluence.
 */
export function evaluateStage1WarningRule(
  enable: boolean,
  smoke: boolean,
  highTemp: boolean,
  pressure: boolean,
  manualEmergency: boolean
): boolean {
  if (!enable) return false;
  // If manual pull is active or primary alarm rule is satisfied, it escalates to Stage 2
  if (manualEmergency) return false;
  
  // At least one condition active, but not the full critical confluence
  const hasAnyHazard = smoke || highTemp || pressure;
  const hasConfluence = evaluatePrimaryAlarmRule(smoke, highTemp, manualEmergency).alarmOutput;
  
  return hasAnyHazard && !hasConfluence;
}

/**
 * Ventilation Overdrive Logic:
 * V_purge = EN AND (S OR H) AND NOT(System_Fault)
 */
export function evaluateVentilationRule(enable: boolean, smoke: boolean, highTemp: boolean, fault: boolean): boolean {
  return AND(AND(enable, OR(smoke, highTemp)), NOT(fault));
}
