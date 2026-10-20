/**
 * 8-to-3 Priority Encoder (74HC148 equivalent logic) & 7-Segment Decoder
 * Identifies the highest-priority zone or event line among multiple simultaneous inputs.
 */

export interface PriorityEncoderResult {
  hasActiveInput: boolean;  // GS (Group Select / Any input active)
  a2: boolean;              // MSB binary bit
  a1: boolean;
  a0: boolean;              // LSB binary bit
  encodedCode: number;      // 0 to 7
  activeMinterm: string;
}

/**
 * Evaluates 8 active-high inputs (I7 highest priority down to I0 lowest).
 */
export function priorityEncoder8to3(inputs: boolean[]): PriorityEncoderResult {
  // Check from highest priority (7) to lowest (0)
  for (let i = 7; i >= 0; i--) {
    if (inputs[i]) {
      const a2 = (i & 4) !== 0;
      const a1 = (i & 2) !== 0;
      const a0 = (i & 1) !== 0;
      return {
        hasActiveInput: true,
        a2,
        a1,
        a0,
        encodedCode: i,
        activeMinterm: `Channel ${i} (Priority ${i})`,
      };
    }
  }

  return {
    hasActiveInput: false,
    a2: false,
    a1: false,
    a0: false,
    encodedCode: 0,
    activeMinterm: 'None (Idle)',
  };
}

/**
 * BCD to 7-Segment Display Decoder (74HC4511 equivalent)
 * Generates segments a, b, c, d, e, f, g for digits 0-9 and hex A-F.
 */
export interface SevenSegmentOutputs {
  a: boolean;
  b: boolean;
  c: boolean;
  d: boolean;
  e: boolean;
  f: boolean;
  g: boolean;
}

export function bcdTo7Segment(digit: number): SevenSegmentOutputs {
  const clamped = Math.max(0, Math.min(15, Math.floor(digit)));
  
  // Standard 7-segment bit patterns (a=bit 0, b=bit 1, ..., g=bit 6)
  const patterns: number[] = [
    0x3F, // 0: a,b,c,d,e,f
    0x06, // 1: b,c
    0x5B, // 2: a,b,d,e,g
    0x4F, // 3: a,b,c,d,g
    0x66, // 4: b,c,f,g
    0x6D, // 5: a,c,d,f,g
    0x7D, // 6: a,c,d,e,f,g
    0x07, // 7: a,b,c
    0x7F, // 8: a,b,c,d,e,f,g
    0x6F, // 9: a,b,c,d,f,g
    0x77, // A
    0x7C, // B
    0x39, // C
    0x5E, // D
    0x79, // E
    0x71, // F
  ];

  const p = patterns[clamped];
  return {
    a: (p & (1 << 0)) !== 0,
    b: (p & (1 << 1)) !== 0,
    c: (p & (1 << 2)) !== 0,
    d: (p & (1 << 3)) !== 0,
    e: (p & (1 << 4)) !== 0,
    f: (p & (1 << 5)) !== 0,
    g: (p & (1 << 6)) !== 0,
  };
}
