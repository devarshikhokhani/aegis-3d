/**
 * Digital Parity Generator & Checker Module
 * Models 74HC280 9-bit Parity Generator/Checker logic.
 * Used for simulated industrial fieldbus telemetry transmission integrity.
 * Detects EMI noise corruption or sensor bitflips before executing safety-critical logic.
 */

export interface TelemetryPacket {
  zoneIndex: number;          // 3-bit zone address (0-5)
  smoke: boolean;             // Data bit 0
  tempHigh: boolean;          // Data bit 1
  pressureAnomaly: boolean;   // Data bit 2
  manualEmergency: boolean;   // Data bit 3
  systemEnable: boolean;      // Data bit 4
  parityBit: boolean;         // Generated even parity bit
}

/**
 * Generates an Even Parity bit using cascaded XOR logic:
 * Total number of 1s in (data bits + parityBit) must be EVEN.
 * P_even = D0 ^ D1 ^ D2 ^ D3 ^ D4 ^ ...
 */
export function generateEvenParity(bits: boolean[]): boolean {
  return bits.reduce((acc, bit) => acc !== bit, false);
}

/**
 * Checks integrity of a received telemetry packet.
 * If transmitted bits have an odd count of 1s, an error is detected.
 */
export function verifyTelemetryPacket(packet: TelemetryPacket): {
  valid: boolean;
  computedParity: boolean;
  receivedParity: boolean;
  bitCount: number;
} {
  const dataBits = [
    (packet.zoneIndex & 4) !== 0,
    (packet.zoneIndex & 2) !== 0,
    (packet.zoneIndex & 1) !== 0,
    packet.smoke,
    packet.tempHigh,
    packet.pressureAnomaly,
    packet.manualEmergency,
    packet.systemEnable,
  ];

  const computedParity = generateEvenParity(dataBits);
  const valid = computedParity === packet.parityBit;
  
  // Total HIGH bits including parity
  const allBits = [...dataBits, packet.parityBit];
  const bitCount = allBits.filter(Boolean).length;

  return {
    valid,
    computedParity,
    receivedParity: packet.parityBit,
    bitCount,
  };
}

/**
 * Helper to package zone sensor telemetry with generated parity bit
 */
export function packageZoneTelemetry(
  zoneIndex: number,
  smoke: boolean,
  tempHigh: boolean,
  pressureAnomaly: boolean,
  manualEmergency: boolean,
  systemEnable: boolean,
  injectParityError: boolean = false
): TelemetryPacket {
  const dataBits = [
    (zoneIndex & 4) !== 0,
    (zoneIndex & 2) !== 0,
    (zoneIndex & 1) !== 0,
    smoke,
    tempHigh,
    pressureAnomaly,
    manualEmergency,
    systemEnable,
  ];

  let parityBit = generateEvenParity(dataBits);
  if (injectParityError) {
    // Invert parity bit to simulate corrupted transmission line
    parityBit = !parityBit;
  }

  return {
    zoneIndex,
    smoke,
    tempHigh,
    pressureAnomaly,
    manualEmergency,
    systemEnable,
    parityBit,
  };
}
