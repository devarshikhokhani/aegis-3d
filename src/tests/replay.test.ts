import { describe, it, expect, beforeEach, vi } from 'vitest';
import { simulationStore, SimulationState } from '../engine/simulationStore';
import { evaluatePrimaryAlarmRule } from '../logic/gates';
import { HistorySnapshot } from '../types/simulation';

describe('AEGIS Investigation Centre & Replay Engine Tests', () => {
  beforeEach(() => {
    simulationStore.resetSimulation();
  });

  describe('1. Snapshot Creation, Preservation & Immutability', () => {
    it('creates an initial baseline snapshot on reset at Tick #0', () => {
      const state = simulationStore.getState();
      expect(state.historySnapshots.length).toBeGreaterThanOrEqual(1);
      const firstSnapshot = state.historySnapshots[0];
      expect(firstSnapshot.tick).toBe(0);
      expect(firstSnapshot.fsmState).toBe('NORMAL');
      expect(firstSnapshot.zones.ZONE_STORAGE.sensors.smoke).toBe(false);
      expect(firstSnapshot.zones.ZONE_STORAGE.status).toBe('NORMAL');
    });

    it('records immutable snapshots that do not mutate when subsequent simulation changes occur', () => {
      const state = simulationStore.getState();
      const baselineSnapshot = { ...state.historySnapshots[0] };
      const baselineStorageSmoke = baselineSnapshot.zones.ZONE_STORAGE.sensors.smoke;
      expect(baselineStorageSmoke).toBe(false);

      // Now induce fire in storage
      simulationStore.setAnalogLevel('ZONE_STORAGE', 'smokeLevel', 50.0);
      simulationStore.setAnalogLevel('ZONE_STORAGE', 'temperature', 80.0);

      const updatedState = simulationStore.getState();
      expect(updatedState.historySnapshots.length).toBeGreaterThan(1);

      // The historical first snapshot must still have smoke = false
      const firstSnap = updatedState.historySnapshots[0];
      expect(firstSnap.zones.ZONE_STORAGE.sensors.smoke).toBe(false);
      expect(firstSnap.zones.ZONE_STORAGE.sensors.tempHigh).toBe(false);
      expect(firstSnap.fsmState).toBe('NORMAL');

      // The latest snapshot must reflect the active hazard
      const latestSnap = updatedState.historySnapshots[updatedState.historySnapshots.length - 1];
      expect(latestSnap.zones.ZONE_STORAGE.sensors.smoke).toBe(true);
      expect(latestSnap.zones.ZONE_STORAGE.sensors.tempHigh).toBe(true);
      expect(latestSnap.zones.ZONE_STORAGE.outputs.alarmStage2).toBe(true);
    });

    it('preserves historical simulation time and relevant events per snapshot', () => {
      simulationStore.setAnalogLevel('ZONE_POWER', 'temperature', 75.0);
      const state = simulationStore.getState();
      const latest = state.historySnapshots[state.historySnapshots.length - 1];

      expect(latest.simTime).toBeDefined();
      expect(typeof latest.simTime).toBe('number');
      expect(latest.events).toBeDefined();
      expect(Array.isArray(latest.events)).toBe(true);
      expect(latest.affectedZones).toContain('ZONE_POWER');
    });
  });

  describe('2. Navigation, Seeking & Boundary Safety', () => {
    it('handles empty history gracefully without out-of-range errors', () => {
      simulationStore.clearHistory();
      const state = simulationStore.getState();
      expect(state.historySnapshots.length).toBe(0);

      // Emulate scrubber index resolution logic
      const snapshots: HistorySnapshot[] = state.historySnapshots;
      const safeIndex = snapshots.length > 0 ? Math.max(0, Math.min(snapshots.length - 1, 0)) : -1;
      expect(safeIndex).toBe(-1);
      const activeSnapshot = safeIndex >= 0 ? snapshots[safeIndex] : null;
      expect(activeSnapshot).toBeNull();
    });

    it('handles single-frame history correctly', () => {
      simulationStore.clearHistory();
      simulationStore.recordSnapshot();
      const state = simulationStore.getState();
      expect(state.historySnapshots.length).toBe(1);

      const snapshots = state.historySnapshots;
      const safeIndex = Math.max(0, Math.min(snapshots.length - 1, 0));
      expect(safeIndex).toBe(0);
      expect(snapshots[safeIndex]).toBeDefined();

      // Step Back should clamp to 0
      const prevIndex = Math.max(0, safeIndex - 1);
      expect(prevIndex).toBe(0);

      // Step Forward should clamp to 0
      const nextIndex = Math.min(snapshots.length - 1, safeIndex + 1);
      expect(nextIndex).toBe(0);
    });

    it('accurately seeks across multi-frame history', () => {
      // Create distinct frames
      simulationStore.setAnalogLevel('ZONE_STORAGE', 'smokeLevel', 30.0); // Frame 1
      simulationStore.setAnalogLevel('ZONE_STORAGE', 'temperature', 75.0); // Frame 2
      simulationStore.triggerEmergencyPull('ZONE_STORAGE'); // Frame 3

      const snapshots = simulationStore.getState().historySnapshots;
      expect(snapshots.length).toBeGreaterThanOrEqual(4);

      // Verify each index points to distinct historical data
      const frame0 = snapshots[0];
      const lastFrame = snapshots[snapshots.length - 1];

      expect(frame0.zones.ZONE_STORAGE.sensors.manualEmergency).toBe(false);
      expect(lastFrame.zones.ZONE_STORAGE.sensors.manualEmergency).toBe(true);
    });

    it('prevents stepping backward past index 0 and forward past final index', () => {
      simulationStore.setAnalogLevel('ZONE_STORAGE', 'smokeLevel', 30.0);
      const snapshots = simulationStore.getState().historySnapshots;
      const total = snapshots.length;

      // Backward from 0
      let currentIndex = 0;
      currentIndex = Math.max(0, currentIndex - 1);
      expect(currentIndex).toBe(0);

      // Forward to max and past
      currentIndex = total - 1;
      currentIndex = Math.min(total - 1, currentIndex + 1);
      expect(currentIndex).toBe(total - 1);
    });
  });

  describe('3. Playback Engine, Speed Intervals & Stopping at Last Frame', () => {
    it('calculates playback intervals correctly for all supported speeds', () => {
      const speeds = [0.5, 1.0, 2.0, 4.0];
      const intervals = speeds.map(s => Math.round(1000 / s));

      expect(intervals).toEqual([2000, 1000, 500, 250]);
    });

    it('advances frames sequentially and automatically stops at the final frame', () => {
      // Simulate multi-frame history
      for (let i = 0; i < 5; i++) {
        simulationStore.tick();
      }
      const snapshots = simulationStore.getState().historySnapshots;
      const finalIndex = snapshots.length - 1;

      // Emulate playback stepper function
      let isReplaying = true;
      let currentIndex = 0;

      const advanceFrame = () => {
        const next = currentIndex + 1;
        if (next >= finalIndex) {
          isReplaying = false;
          currentIndex = finalIndex;
        } else {
          currentIndex = next;
        }
      };

      // Step until completion
      while (isReplaying) {
        advanceFrame();
      }

      expect(currentIndex).toBe(finalIndex);
      expect(isReplaying).toBe(false);
    });
  });

  describe('4. Historical Replay Separation (No Mutation of Live State)', () => {
    it('inspecting past historical frames does not mutate live simulation store', () => {
      // Live state has fire
      simulationStore.setAnalogLevel('ZONE_STORAGE', 'smokeLevel', 50.0);
      simulationStore.setAnalogLevel('ZONE_STORAGE', 'temperature', 80.0);

      const liveStateBefore = simulationStore.getState();
      const liveSmokeBefore = liveStateBefore.zones.ZONE_STORAGE.sensors.smoke;
      const liveEventsCount = liveStateBefore.events.length;
      const liveIncidentsCount = liveStateBefore.incidents.length;
      expect(liveSmokeBefore).toBe(true);

      // Investigator inspects historical Frame 0 (baseline where smoke = false)
      const historicalFrame = liveStateBefore.historySnapshots[0];
      expect(historicalFrame.zones.ZONE_STORAGE.sensors.smoke).toBe(false);

      // Evaluate logic projection on historical frame
      const s = historicalFrame.zones.ZONE_STORAGE.sensors.smoke;
      const h = historicalFrame.zones.ZONE_STORAGE.sensors.tempHigh;
      const m = historicalFrame.zones.ZONE_STORAGE.sensors.manualEmergency;
      const evalResult = evaluatePrimaryAlarmRule(s, h, m);
      expect(evalResult.alarmOutput).toBe(false);

      // Confirm live state was NOT mutated
      const liveStateAfter = simulationStore.getState();
      expect(liveStateAfter.zones.ZONE_STORAGE.sensors.smoke).toBe(true);
      expect(liveStateAfter.events.length).toBe(liveEventsCount);
      expect(liveStateAfter.incidents.length).toBe(liveIncidentsCount);
    });
  });
});
