/**
 * Evacuation Graph Routing Engine
 * Implements Dijkstra's algorithm to compute safe egress routes from any zone
 * to nearest available emergency exits, accounting for dynamic hazard blocks.
 */

import { ZoneId, EvacuationRouteResult } from '../types/simulation';

export interface FacilityNode {
  id: string;
  name: string;
  position: [number, number, number]; // [x, y, z]
  isExit: boolean;
  associatedZoneId?: ZoneId;
}

export interface FacilityEdge {
  fromNodeId: string;
  toNodeId: string;
  distanceMeters: number;
  corridorName: string;
  passingThroughZoneId?: ZoneId;
}

export const FACILITY_NODES: Record<string, FacilityNode> = {
  // Zone Waypoints
  NODE_PROD: {
    id: 'NODE_PROD',
    name: 'Production Hall Floor',
    position: [-10, 0, -5],
    isExit: false,
    associatedZoneId: 'ZONE_PROD',
  },
  NODE_POWER: {
    id: 'NODE_POWER',
    name: 'Power Room Substation',
    position: [-10, 0, 7],
    isExit: false,
    associatedZoneId: 'ZONE_POWER',
  },
  NODE_STORAGE: {
    id: 'NODE_STORAGE',
    name: 'Storage Area Racks',
    position: [6, 0, 7],
    isExit: false,
    associatedZoneId: 'ZONE_STORAGE',
  },
  NODE_CTRL: {
    id: 'NODE_CTRL',
    name: 'Control Room Console',
    position: [6, 0, -5],
    isExit: false,
    associatedZoneId: 'ZONE_CTRL',
  },
  NODE_UTIL: {
    id: 'NODE_UTIL',
    name: 'Utility Compressor Bay',
    position: [-2, 0, 1],
    isExit: false,
    associatedZoneId: 'ZONE_UTIL',
  },
  // Main Hallway Intersections
  NODE_CORRIDOR_WEST: {
    id: 'NODE_CORRIDOR_WEST',
    name: 'West Walkway Junction',
    position: [-10, 0, 1],
    isExit: false,
  },
  NODE_CORRIDOR_CENTER: {
    id: 'NODE_CORRIDOR_CENTER',
    name: 'Central Spine Intersection',
    position: [0, 0, 1],
    isExit: false,
  },
  NODE_CORRIDOR_EAST: {
    id: 'NODE_CORRIDOR_EAST',
    name: 'East Exit Concourse',
    position: [12, 0, 1],
    isExit: false,
  },
  NODE_CORRIDOR_NORTH: {
    id: 'NODE_CORRIDOR_NORTH',
    name: 'North Yard Corridor',
    position: [-2, 0, -8],
    isExit: false,
  },
  // Emergency Exits
  EXIT_EAST_STAIRS: {
    id: 'EXIT_EAST_STAIRS',
    name: 'Emergency Exit A — East Blast Doors',
    position: [16, 0, 1],
    isExit: true,
    associatedZoneId: 'ZONE_EXIT',
  },
  EXIT_NORTH_YARD: {
    id: 'EXIT_NORTH_YARD',
    name: 'Emergency Exit B — North Assembly Yard',
    position: [-2, 0, -12],
    isExit: true,
  },
};

export const FACILITY_EDGES: FacilityEdge[] = [
  // Production Hall connections
  { fromNodeId: 'NODE_PROD', toNodeId: 'NODE_CORRIDOR_WEST', distanceMeters: 6.0, corridorName: 'West Production Aisle', passingThroughZoneId: 'ZONE_PROD' },
  { fromNodeId: 'NODE_PROD', toNodeId: 'NODE_CORRIDOR_NORTH', distanceMeters: 8.5, corridorName: 'North Machine Access Walkway' },
  
  // Power Room connections
  { fromNodeId: 'NODE_POWER', toNodeId: 'NODE_CORRIDOR_WEST', distanceMeters: 6.0, corridorName: 'High Voltage Service Vestibule', passingThroughZoneId: 'ZONE_POWER' },
  
  // Utility connections
  { fromNodeId: 'NODE_UTIL', toNodeId: 'NODE_CORRIDOR_CENTER', distanceMeters: 3.0, corridorName: 'Utility Access Corridor', passingThroughZoneId: 'ZONE_UTIL' },
  { fromNodeId: 'NODE_UTIL', toNodeId: 'NODE_CORRIDOR_WEST', distanceMeters: 8.0, corridorName: 'West Trench Walkway' },

  // Storage Area connections
  { fromNodeId: 'NODE_STORAGE', toNodeId: 'NODE_CORRIDOR_CENTER', distanceMeters: 8.5, corridorName: 'Storage Staging Lane', passingThroughZoneId: 'ZONE_STORAGE' },
  { fromNodeId: 'NODE_STORAGE', toNodeId: 'NODE_CORRIDOR_EAST', distanceMeters: 8.5, corridorName: 'East Pallet Gangway' },

  // Control Room connections
  { fromNodeId: 'NODE_CTRL', toNodeId: 'NODE_CORRIDOR_CENTER', distanceMeters: 8.5, corridorName: 'Central Operator Corridor', passingThroughZoneId: 'ZONE_CTRL' },
  { fromNodeId: 'NODE_CTRL', toNodeId: 'NODE_CORRIDOR_EAST', distanceMeters: 8.5, corridorName: 'Command Exit Passage' },

  // Central Walkway Spine
  { fromNodeId: 'NODE_CORRIDOR_WEST', toNodeId: 'NODE_CORRIDOR_CENTER', distanceMeters: 10.0, corridorName: 'Main Arterial Corridor West' },
  { fromNodeId: 'NODE_CORRIDOR_CENTER', toNodeId: 'NODE_CORRIDOR_EAST', distanceMeters: 12.0, corridorName: 'Main Arterial Corridor East' },
  { fromNodeId: 'NODE_CORRIDOR_CENTER', toNodeId: 'NODE_CORRIDOR_NORTH', distanceMeters: 9.0, corridorName: 'North Yard Link' },

  // Connections to Emergency Exits
  { fromNodeId: 'NODE_CORRIDOR_EAST', toNodeId: 'EXIT_EAST_STAIRS', distanceMeters: 4.0, corridorName: 'Exit A Pressurized Stairwell Vestibule' },
  { fromNodeId: 'NODE_CORRIDOR_NORTH', toNodeId: 'EXIT_NORTH_YARD', distanceMeters: 4.0, corridorName: 'Exit B Exterior Egress Ramp' },
];

/**
 * Calculates safest evacuation route using Dijkstra's algorithm.
 * Dynamically avoids corridors blocked by active emergency/fire hazards.
 */
export function calculateEvacuationRoute(
  startZoneId: ZoneId,
  hazardZones: ZoneId[]
): EvacuationRouteResult {
  // Find start node
  const startNodeEntry = Object.values(FACILITY_NODES).find(n => n.associatedZoneId === startZoneId);
  const startNodeId = startNodeEntry ? startNodeEntry.id : 'NODE_PROD';

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();
  const blockedCorridors: string[] = [];

  // Initialize graph
  for (const nodeId of Object.keys(FACILITY_NODES)) {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
    unvisited.add(nodeId);
  }
  distances[startNodeId] = 0;

  // Build adjacency list
  const adj: Record<string, { to: string; weight: number; corridor: string; blocked: boolean }[]> = {};
  for (const nodeId of Object.keys(FACILITY_NODES)) {
    adj[nodeId] = [];
  }

  for (const edge of FACILITY_EDGES) {
    const isBlocked = edge.passingThroughZoneId ? hazardZones.includes(edge.passingThroughZoneId) && edge.passingThroughZoneId !== startZoneId : false;
    
    if (isBlocked && !blockedCorridors.includes(edge.corridorName)) {
      blockedCorridors.push(edge.corridorName);
    }

    const weight = isBlocked ? Infinity : edge.distanceMeters;

    adj[edge.fromNodeId].push({ to: edge.toNodeId, weight, corridor: edge.corridorName, blocked: isBlocked });
    adj[edge.toNodeId].push({ to: edge.fromNodeId, weight, corridor: edge.corridorName, blocked: isBlocked });
  }

  while (unvisited.size > 0) {
    // Pick unvisited node with smallest distance
    let current: string | null = null;
    let shortest = Infinity;
    for (const node of unvisited) {
      if (distances[node] < shortest) {
        shortest = distances[node];
        current = node;
      }
    }

    if (!current || distances[current] === Infinity) {
      break; // Remaining nodes unreachable
    }

    unvisited.delete(current);

    // Stop if we reached an exit
    if (FACILITY_NODES[current].isExit) {
      // Reconstruct path
      const path: string[] = [];
      let step: string | null = current;
      while (step) {
        path.unshift(step);
        step = previous[step];
      }

      const waypoints = path.map(id => FACILITY_NODES[id].position);
      const totalDistanceMeters = distances[current];
      // Average walking speed in evacuation = 1.2 m/s
      const evacuationEstimatedSeconds = Math.round(totalDistanceMeters / 1.2);

      return {
        routeFound: true,
        waypoints,
        blockedCorridors,
        nearestExit: FACILITY_NODES[current].name,
        totalDistanceMeters,
        evacuationEstimatedSeconds,
      };
    }

    for (const neighbor of adj[current]) {
      if (!unvisited.has(neighbor.to) || neighbor.blocked) continue;
      const alt = distances[current] + neighbor.weight;
      if (alt < distances[neighbor.to]) {
        distances[neighbor.to] = alt;
        previous[neighbor.to] = current;
      }
    }
  }

  // Fallback: If all routes blocked or already at exit
  return {
    routeFound: false,
    waypoints: [FACILITY_NODES[startNodeId].position],
    blockedCorridors,
    nearestExit: 'All primary exits blocked by active hazard zone boundaries',
    totalDistanceMeters: 0,
    evacuationEstimatedSeconds: 0,
  };
}
