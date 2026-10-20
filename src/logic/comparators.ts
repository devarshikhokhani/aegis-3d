/**
 * Digital Comparator Module
 * Converts simulated analog measurements into discrete digital Boolean signals.
 * Uses configurable reference voltages / thresholds with digital hysteresis (Schmitt trigger model).
 */

export interface ComparatorThresholds {
  smokeHighPercent: number;        // Threshold for Smoke digital HIGH (e.g. 25%)
  smokeHysteresis: number;         // Lower threshold to clear (e.g. 18%)
  tempHighCelsius: number;         // Threshold for High Temperature (e.g. 60°C)
  tempHysteresis: number;          // Lower threshold to clear (e.g. 52°C)
  pressureLowPsi: number;          // Safe pressure lower limit (e.g. 45 PSI)
  pressureHighPsi: number;         // Safe pressure upper limit (e.g. 115 PSI)
  pressureHysteresis: number;      // PSI boundary margin
}

export const DEFAULT_THRESHOLDS: ComparatorThresholds = {
  smokeHighPercent: 25.0,
  smokeHysteresis: 5.0,
  tempHighCelsius: 60.0,
  tempHysteresis: 6.0,
  pressureLowPsi: 45.0,
  pressureHighPsi: 115.0,
  pressureHysteresis: 5.0,
};

/**
 * 2-bit Magnitude Comparator Model:
 * Evaluates whether measured input (A) > Reference Threshold (B).
 * Implements Schmitt trigger hysteresis based on previous state.
 */
export function evaluateComparatorWithHysteresis(
  currentValue: number,
  highThreshold: number,
  hysteresis: number,
  previousState: boolean
): boolean {
  if (previousState) {
    // Already in HIGH state: must drop strictly below (threshold - hysteresis) to clear
    return currentValue >= (highThreshold - hysteresis);
  } else {
    // Currently in LOW state: must rise above highThreshold to trip
    return currentValue >= highThreshold;
  }
}

/**
 * Dual-Window Pressure Comparator:
 * Generates digital anomaly HIGH if pressure is either below safe low boundary or above safe high boundary.
 */
export function evaluateWindowComparator(
  currentPsi: number,
  lowThreshold: number,
  highThreshold: number,
  previousState: boolean,
  margin: number = 3.0
): boolean {
  if (previousState) {
    // Needs to return safely within the inner window
    const insideSafeBand = currentPsi >= (lowThreshold + margin) && currentPsi <= (highThreshold - margin);
    return !insideSafeBand;
  } else {
    // Trips if outside [lowThreshold, highThreshold]
    const outsideSafeBand = currentPsi < lowThreshold || currentPsi > highThreshold;
    return outsideSafeBand;
  }
}
