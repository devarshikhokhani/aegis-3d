import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  AlertOctagon, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight, 
  AlertTriangle, 
  XCircle,
  Eye,
  FileText
} from 'lucide-react';
import { SimulationState, simulationStore } from '../engine/simulationStore';
import { SeverityBadge, FSMStateBadge } from '../components/shared/StatusBadge';
import { IncidentRecord, IncidentStatus, SeverityLevel } from '../types/simulation';

export const IncidentManagement: React.FC = () => {
  const { simState } = useOutletContext<{ simState: SimulationState }>();
  const navigate = useNavigate();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    simState.selectedIncidentId || (simState.incidents.length > 0 ? simState.incidents[0].id : null)
  );
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newNoteText, setNewNoteText] = useState<string>('');

  const selectedIncident = simState.incidents.find(i => i.id === selectedIncidentId);

  // Filter incidents
  const filteredIncidents = simState.incidents.filter(inc => {
    if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && inc.status !== filterStatus) return false;
    if (searchQuery && !inc.title.toLowerCase().includes(searchQuery.toLowerCase()) && !inc.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleAddNote = () => {
    if (selectedIncident && newNoteText.trim()) {
      simulationStore.addIncidentNote(selectedIncident.id, newNoteText.trim());
      setNewNoteText('');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-mono">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase">
              Incident Management & Response
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-mono">
              AUDIT LOGGED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulated industrial incident lifecycle tracker with sequential operator verification workflows.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Total Recorded:</span>
          <span className="font-bold text-slate-200">{simState.incidents.length}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Unresolved:</span>
          <span className="font-bold text-red-400">
            {simState.incidents.filter(i => !i.resolved).length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-industrial-900 border border-industrial-800 p-3 rounded-lg text-xs">
        <div className="flex items-center space-x-2 flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search incident ID or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-industrial-950 border border-industrial-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-industrial-950 border border-industrial-800 rounded px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-industrial-950 border border-industrial-800 rounded px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="DETECTED">Detected</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="CONDITION_CLEARED">Condition Cleared</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Incident List on left + Detail on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Incident List (5 cols) */}
        <div className="lg:col-span-5 bg-industrial-900 border border-industrial-800 rounded-lg flex flex-col h-[600px] overflow-hidden">
          <div className="p-3 bg-industrial-950/80 border-b border-industrial-800 flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
            <span>Incident Queue</span>
            <span>{filteredIncidents.length} Records</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredIncidents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <CheckCircle className="w-8 h-8 text-emerald-500/30 mb-2" />
                <p className="text-xs">No incidents match current filter criteria.</p>
              </div>
            ) : (
              filteredIncidents.map((incident) => {
                const isSelected = incident.id === selectedIncidentId;
                return (
                  <div
                    key={incident.id}
                    onClick={() => setSelectedIncidentId(incident.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-industrial-850 border-cyan-500 shadow-lg'
                        : 'bg-industrial-950 border-industrial-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{incident.id}</span>
                      <SeverityBadge severity={incident.severity} />
                    </div>

                    <div className="font-semibold text-slate-300 mt-1 truncate">
                      {incident.title}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-industrial-800">
                      <span>{incident.zoneName}</span>
                      <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                        incident.status === 'DETECTED' ? 'bg-red-950 text-red-400' :
                        incident.status === 'ACKNOWLEDGED' ? 'bg-amber-950 text-amber-400' :
                        incident.status === 'CONDITION_CLEARED' ? 'bg-blue-950 text-blue-400' :
                        'bg-emerald-950 text-emerald-400'
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Incident Detail & Response Workflow (7 cols) */}
        <div className="lg:col-span-7 bg-industrial-900 border border-industrial-800 rounded-lg flex flex-col h-[600px] overflow-hidden">
          {selectedIncident ? (
            <div className="flex flex-col h-full">
              {/* Detail Header */}
              <div className="p-4 bg-industrial-950 border-b border-industrial-800 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-cyan-neon tracking-wider">
                      {selectedIncident.id}
                    </span>
                    <span className="text-slate-600">|</span>
                    <SeverityBadge severity={selectedIncident.severity} />
                    <span className="text-slate-600">|</span>
                    <span className="text-xs text-amber-400 font-bold">
                      {selectedIncident.status}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-100 mt-0.5">
                    {selectedIncident.title}
                  </h2>
                </div>

                <button
                  onClick={() => {
                    simulationStore.selectZone(selectedIncident.zoneId);
                    navigate('/facility');
                  }}
                  className="px-2.5 py-1.5 rounded bg-industrial-850 hover:bg-industrial-800 border border-industrial-700 text-cyan-400 text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View 3D Zone</span>
                </button>
              </div>

              {/* Scrollable Detail Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
                {/* Response Workflow Actions Bar */}
                <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Simulated Response Actions
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedIncident.status === 'DETECTED' && (
                      <button
                        onClick={() => simulationStore.acknowledgeIncident(selectedIncident.id)}
                        className="px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition-colors"
                      >
                        Acknowledge Incident
                      </button>
                    )}

                    <button
                      onClick={() => simulationStore.clearHazardInZone(selectedIncident.zoneId)}
                      className="px-3 py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-bold transition-colors"
                    >
                      Clear Physical Hazard (Extinguish)
                    </button>

                    {selectedIncident.status === 'CONDITION_CLEARED' && !selectedIncident.resolved && (
                      <button
                        onClick={() => simulationStore.closeIncident(selectedIncident.id)}
                        className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-industrial-950 font-bold transition-colors shadow-lg shadow-cyan-600/20"
                      >
                        Complete Recovery & Close
                      </button>
                    )}
                  </div>
                </div>

                {/* Triggering Conditions & Logic Outputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-industrial-950 p-3 rounded border border-industrial-800 space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Triggering Inputs Snapshot
                    </span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Smoke S:</span>
                        <span className={selectedIncident.triggeringInputs.smoke ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {selectedIncident.triggeringInputs.smoke ? 'HIGH (1)' : 'LOW (0)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Temp H:</span>
                        <span className={selectedIncident.triggeringInputs.tempHigh ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                          {selectedIncident.triggeringInputs.tempHigh ? 'HIGH (1)' : 'LOW (0)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Manual M:</span>
                        <span className={selectedIncident.triggeringInputs.manualEmergency ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {selectedIncident.triggeringInputs.manualEmergency ? 'PULLED (1)' : '0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-industrial-950 p-3 rounded border border-industrial-800 space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Controller Reaction
                    </span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">FSM State:</span>
                        <span className="text-cyan-neon font-bold">{selectedIncident.fsmStateSnapshot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Klaxon Stage 2:</span>
                        <span className="text-red-400 font-bold">LATCHED</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Zone Egress:</span>
                        <span className="text-emerald-400 font-bold">UNLOCKED</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit History Timeline */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Audit Trail & Lifecycle History
                  </span>
                  <div className="bg-industrial-950 p-3 rounded border border-industrial-800 space-y-2.5 max-h-40 overflow-y-auto">
                    {selectedIncident.historyTimeline.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2 border-b border-industrial-850 pb-1.5 last:border-b-0 last:pb-0">
                        <Clock className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-200">{item.action}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">{item.description}</p>
                          <span className="text-[9px] text-slate-500 font-sans">By: {item.user}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operator Investigation Notes */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Investigation Notes</span>
                  </span>

                  <div className="space-y-1.5">
                    {selectedIncident.operatorNotes.map((note, idx) => (
                      <div key={idx} className="p-2 rounded bg-industrial-950 border border-industrial-800 text-[11px] text-slate-300 font-sans">
                        {note}
                      </div>
                    ))}

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add operator notes or root cause findings..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddNote();
                        }}
                        className="flex-1 bg-industrial-950 border border-industrial-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs font-sans"
                      />
                      <button
                        onClick={handleAddNote}
                        className="px-3 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs transition-colors shrink-0"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-slate-500 text-center">
              <FileText className="w-10 h-10 text-slate-700 mb-2" />
              <p className="text-xs">Select an incident from the queue to inspect lifecycle and take action.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
