import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  DoorOpen, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  Eye, 
  ArrowRight,
  Boxes,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { SimulationState, simulationStore, INITIAL_ZONE_CONFIGS } from '../engine/simulationStore';
import { calculateEvacuationRoute, FACILITY_NODES } from '../logic/routing';
import { ZoneId } from '../types/simulation';

export const EmergencyResources: React.FC = () => {
  const { simState } = useOutletContext<{ simState: SimulationState }>();
  const navigate = useNavigate();

  const [selectedZone, setSelectedZone] = useState<ZoneId>('ZONE_PROD');
  const [blockedZones, setBlockedZones] = useState<ZoneId[]>(['ZONE_STORAGE']);

  const routeResult = calculateEvacuationRoute(selectedZone, blockedZones);

  const toggleZoneBlock = (zId: ZoneId) => {
    if (blockedZones.includes(zId)) {
      setBlockedZones(blockedZones.filter(z => z !== zId));
    } else {
      setBlockedZones([...blockedZones, zId]);
    }
  };

  const emergencyResources = [
    { id: 'RES-01', name: 'Emergency Exit A (Blast Doors)', type: 'EXIT', location: 'East Concourse', status: 'AVAILABLE', capacity: '200 pers' },
    { id: 'RES-02', name: 'Emergency Exit B (North Yard)', type: 'EXIT', location: 'North Walkway', status: 'AVAILABLE', capacity: '150 pers' },
    { id: 'RES-03', name: 'CO2 Gas Fire Suppression Bank', type: 'SUPPRESSION', location: 'Power Room Substation', status: 'STANDBY', capacity: '4 x 50kg' },
    { id: 'RES-04', name: 'Deluge Foam Sprinkler Loop', type: 'SUPPRESSION', location: 'Storage Area Racks', status: 'STANDBY', capacity: 'High Flow' },
    { id: 'RES-05', name: 'Pressurized Eyewash & Safety Shower', type: 'FIRST_AID', location: 'Storage Chemical Staging', status: 'INSPECTED', capacity: 'Continuous' },
    { id: 'RES-06', name: 'Assembly Muster Point Alpha', type: 'MUSTER', location: 'East Parking Concourse', status: 'OPEN', capacity: 'Safe Zone' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-mono">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase">
              Emergency Resources & Simulated Evacuation Router
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              GRAPH PATHFINDING A* / DIJKSTRA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulated egress pathway calculation with dynamic avoidance of active fire and hazard corridors.
          </p>
        </div>

        <button
          onClick={() => {
            simulationStore.selectZone(selectedZone);
            navigate('/facility');
          }}
          className="px-3 py-1.5 rounded bg-industrial-900 hover:bg-industrial-850 border border-industrial-700 text-cyan-400 text-xs flex items-center space-x-1.5 transition-colors"
        >
          <Boxes className="w-4 h-4" />
          <span>View 3D Egress Ribbon</span>
        </button>
      </div>

      {/* Main Grid: Interactive Evacuation Pathfinder (7 cols) + Resource Inventory (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Evacuation Pathfinder (7 cols) */}
        <div className="lg:col-span-7 bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-industrial-800">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Compass className="w-4 h-4" />
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Simulated Dynamic Egress Pathfinding
              </h2>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Dijkstra Shortest Path</span>
          </div>

          {/* Source Zone Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Select Evacuation Origin Zone:</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value as ZoneId)}
                className="w-full bg-industrial-950 border border-industrial-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
              >
                {(Object.keys(INITIAL_ZONE_CONFIGS) as ZoneId[]).map((zid) => (
                  <option key={zid} value={zid}>{INITIAL_ZONE_CONFIGS[zid].name}</option>
                ))}
              </select>
            </div>

            {/* Blocked Corridors Simulator */}
            <div className="space-y-1">
              <label className="text-slate-400">Simulate Hazard Blocks (Click to toggle):</label>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(INITIAL_ZONE_CONFIGS) as ZoneId[]).map((zid) => {
                  const isBlocked = blockedZones.includes(zid);
                  return (
                    <button
                      key={zid}
                      onClick={() => toggleZoneBlock(zid)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        isBlocked 
                          ? 'bg-red-950 text-red-400 border border-red-800' 
                          : 'bg-industrial-950 text-slate-400 border border-industrial-800 hover:text-white'
                      }`}
                    >
                      {zid.replace('ZONE_', '')} {isBlocked ? '✕' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Route Calculation Result Box */}
          <div className="bg-industrial-950 p-4 rounded-lg border border-industrial-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Computed Optimal Safe Egress</span>
              {routeResult.routeFound ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>SAFE ROUTE AVAILABLE</span>
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 flex items-center space-x-1">
                  <XCircle className="w-3 h-3" />
                  <span>EGRESS BLOCKED</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-industrial-900 border border-industrial-800">
                <span className="text-[10px] text-slate-500 uppercase block">Destination Exit</span>
                <span className="font-bold text-cyan-neon text-[11px] truncate block mt-0.5">
                  {routeResult.nearestExit.split('—')[0]}
                </span>
              </div>
              <div className="p-2 rounded bg-industrial-900 border border-industrial-800">
                <span className="text-[10px] text-slate-500 uppercase block">Total Distance</span>
                <span className="font-bold text-slate-200 text-sm block mt-0.5">
                  {routeResult.totalDistanceMeters.toFixed(1)} m
                </span>
              </div>
              <div className="p-2 rounded bg-industrial-900 border border-industrial-800">
                <span className="text-[10px] text-slate-500 uppercase block">Est. Egress Time</span>
                <span className="font-bold text-amber-400 text-sm block mt-0.5">
                  ~{routeResult.evacuationEstimatedSeconds} s
                </span>
              </div>
            </div>

            {/* Blocked corridor notice */}
            {routeResult.blockedCorridors.length > 0 && (
              <div className="p-2.5 rounded bg-amber-950/40 border border-amber-900/60 text-[11px] text-amber-300">
                <div className="font-bold flex items-center space-x-1 mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Avoided Corridors Due to Hazard:</span>
                </div>
                <ul className="list-disc list-inside text-[10px] text-amber-400/80">
                  {routeResult.blockedCorridors.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Equipment & Resources Directory (5 cols) */}
        <div className="lg:col-span-5 bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-3 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-industrial-800">
              <div className="flex items-center space-x-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Facility Safety Resource Directory
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">6 Assets</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {emergencyResources.map((res) => (
                <div
                  key={res.id}
                  className="p-2.5 rounded bg-industrial-950 border border-industrial-800 text-xs space-y-1 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{res.name}</span>
                    <span className="text-[10px] px-1.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      {res.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Location: {res.location}</span>
                    <span>{res.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-industrial-800 text-[10px] text-slate-500">
            * All emergency resources are simulated facility assets for educational digital twin demonstration.
          </div>
        </div>
      </div>
    </div>
  );
};
