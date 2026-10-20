/**
 * 8-to-1 Digital Multiplexer (74HC151 equivalent logic)
 * Allows routing any one of 8 digital sensor/zone telemetry lines to a shared central bus
 * using a 3-bit selection bus (S2, S1, S0) with an active-low Enable (EN_L).
 */

export interface MuxInputs {
  d0: boolean;
  d1: boolean;
  d2: boolean;
  d3: boolean;
  d4: boolean;
  d5: boolean;
  d6: boolean;
  d7: boolean;
}

export function multiplexer8to1(
  inputs: MuxInputs,
  s2: boolean,
  s1: boolean,
  s0: boolean,
  enableActiveLow: boolean = false
): {
  outputY: boolean;
  outputW: boolean; // Inverted output W = NOT(Y)
  selectedChannel: number;
} {
  // If active-low strobe is HIGH, MUX is disabled: Y is LOW, W is HIGH
  if (enableActiveLow) {
    return { outputY: false, outputW: true, selectedChannel: -1 };
  }

  // Calculate channel number: 4*S2 + 2*S1 + 1*S0
  const channel = (s2 ? 4 : 0) + (s1 ? 2 : 0) + (s0 ? 1 : 0);

  let outputY = false;
  switch (channel) {
    case 0: outputY = inputs.d0; break;
    case 1: outputY = inputs.d1; break;
    case 2: outputY = inputs.d2; break;
    case 3: outputY = inputs.d3; break;
    case 4: outputY = inputs.d4; break;
    case 5: outputY = inputs.d5; break;
    case 6: outputY = inputs.d6; break;
    case 7: outputY = inputs.d7; break;
  }

  return {
    outputY,
    outputW: !outputY,
    selectedChannel: channel,
  };
}

/**
 * 1-to-8 Demultiplexer (74HC138 equivalent logic):
 * Routes a single control or reset pulse to a specific zone's receiver.
 */
export function demultiplexer1to8(
  inputData: boolean,
  s2: boolean,
  s1: boolean,
  s0: boolean,
  enableActiveLow: boolean = false
): boolean[] {
  const outputs = [false, false, false, false, false, false, false, false];
  if (enableActiveLow) return outputs;

  const channel = (s2 ? 4 : 0) + (s1 ? 2 : 0) + (s0 ? 1 : 0);
  outputs[channel] = inputData;
  return outputs;
}
