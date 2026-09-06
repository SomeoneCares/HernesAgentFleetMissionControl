import React, { useState, useRef, useEffect } from 'react';
import { useCluster } from '../context/ClusterContext';
import { ChevronDown, Server, Layers, Plus, Check, Cpu, Shield, Sparkles, Activity, ArrowRightLeft, GitFork, Settings } from 'lucide-react';
import { CreateFleetModal } from './CreateFleetModal';
import { FleetRoutingModal } from './FleetRoutingModal';
import { PortalSettingsModal } from './PortalSettingsModal';

export const FleetSelectorDropdown: React.FC = () => {
  const { fleets, activeFleetId, setActiveFleetId, createFleet, agents, tasks, routingConfig } = useCluster();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFleet = fleets.find(f => f.id === activeFleetId) || null;

  // Counts for each fleet
  const getFleetStats = (fleetId: string) => {
    const fleetAgents = agents.filter(a => (a.fleetId || 'fleet-alpha-core') === fleetId);
    const fleetTasks = tasks.filter(t => (t.fleetId || 'fleet-alpha-core') === fleetId);
    const busyAgents = fleetAgents.filter(a => a.status === 'BUSY');
    return {
      agentCount: fleetAgents.length,
      taskCount: fleetTasks.length,
      busyCount: busyAgents.length
    };
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 text-xs font-mono transition-all duration-200 cursor-pointer group"
          title="Select active fleet on this Hermes server"
        >
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              FLEET:
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-200">
            {activeFleetId === 'all' ? (
              <span className="font-bold text-white tracking-wide">
                ALL FLEETS (FEDERATED)
              </span>
            ) : (
              <>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: activeFleet?.color || '#00f2fe' }}
                />
                <span className="font-bold text-white tracking-wide">
                  {activeFleet ? activeFleet.codename : 'FLEET-ALPHA-CORE'}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 pl-1 border-l border-white/10 text-slate-400 group-hover:text-cyan-400 transition-colors">
            <span className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-cyan-300 font-medium">
              {activeFleetId === 'all'
                ? `${agents.length} AGENTS`
                : `${agents.filter(a => (a.fleetId || 'fleet-alpha-core') === activeFleetId).length} AGENTS`}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0b0f19]/95 backdrop-blur-xl border border-white/[0.14] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] p-2.5 z-50 font-mono text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header info */}
            <div className="px-3 py-2 border-b border-white/[0.08] mb-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                  <Server className="w-3 h-3" />
                  HERMES AGENT SERVER
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300">
                  {fleets.length} FLEETS HOSTED
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Switch workload context or view aggregate swarm status across this server host.
              </p>
            </div>

            {/* Federated View Option */}
            <button
              onClick={() => {
                setActiveFleetId('all');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all mb-1 cursor-pointer ${
                activeFleetId === 'all'
                  ? 'bg-cyan-500/15 border border-cyan-400/40 text-white'
                  : 'hover:bg-white/[0.05] border border-transparent text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center text-cyan-300">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-[11px] text-white flex items-center gap-1.5">
                    Federated View (All Fleets)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Aggregate swarm view: {agents.length} agents across {fleets.length} fleets
                  </div>
                </div>
              </div>
              {activeFleetId === 'all' && (
                <div className="w-5 h-5 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>

            {/* Fleets List */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-0.5">
              {fleets.map(fleet => {
                const stats = getFleetStats(fleet.id);
                const isSelected = activeFleetId === fleet.id;
                return (
                  <button
                    key={fleet.id}
                    onClick={() => {
                      setActiveFleetId(fleet.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border border-cyan-400/40 text-white shadow-[0_0_15px_rgba(76,215,246,0.15)]'
                        : 'hover:bg-white/[0.05] border border-white/[0.06] text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                        style={{ backgroundColor: fleet.color || '#00f2fe' }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[11px] text-white truncate">
                            {fleet.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.08] text-slate-300 font-mono">
                            {fleet.codename}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {fleet.description}
                        </p>
                        <div className="flex items-center gap-3 text-[9px] text-slate-400 mt-1.5">
                          <span className="flex items-center gap-1 text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {stats.agentCount} Agents ({stats.busyCount} active)
                          </span>
                          <span>•</span>
                          <span>{stats.taskCount} Tasks</span>
                          <span>•</span>
                          <span className="text-cyan-300 truncate max-w-[120px]">{fleet.vramAllocated}</span>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center shrink-0 ml-2 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions: Partition New Fleet & Routing Rules */}
            <div className="pt-2 mt-2 border-t border-white/[0.08] flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsRoutingModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold transition-all cursor-pointer group"
                type="button"
              >
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-180 transition-transform duration-300" />
                  <span>Fleet Routing & Handoff Rules</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-200">
                  {routingConfig.routingRules.length} Rules
                </span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSettingsModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-cyan-400/30 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer group"
                type="button"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  <span>Portal & Daemon Settings</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Server & Backup</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsCreateModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
                type="button"
              >
                <Plus className="w-3.5 h-3.5 text-slate-400" />
                <span>Partition New Fleet on Host</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for creating a new fleet */}
      <CreateFleetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createFleet}
      />

      {/* Modal for fleet routing & handoff rules */}
      <FleetRoutingModal
        isOpen={isRoutingModalOpen}
        onClose={() => setIsRoutingModalOpen(false)}
      />

      {/* Modal for portal & cluster settings */}
      <PortalSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </>
  );
};
