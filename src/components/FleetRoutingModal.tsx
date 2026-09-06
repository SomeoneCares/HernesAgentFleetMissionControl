import React, { useState } from 'react';
import { useCluster } from '../context/ClusterContext';
import { 
  FleetRoutingRule, 
  FleetHandoffRule, 
  RoutingStrategy 
} from '../types';
import { 
  X, 
  GitFork, 
  ArrowRightLeft, 
  Shield, 
  Cpu, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Layers, 
  Play, 
  Sliders, 
  Zap, 
  Compass, 
  RotateCcw,
  Sparkles,
  Clock,
  Radio,
  FileCheck
} from 'lucide-react';

interface FleetRoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FleetRoutingModal: React.FC<FleetRoutingModalProps> = ({ isOpen, onClose }) => {
  const { 
    fleets, 
    agents,
    routingConfig, 
    updateRoutingConfig, 
    addRoutingRule, 
    updateRoutingRule, 
    deleteRoutingRule,
    addHandoffRule,
    updateHandoffRule,
    deleteHandoffRule,
    showToast 
  } = useCluster();

  const [activeTab, setActiveTab] = useState<'routing' | 'handoff' | 'simulator' | 'settings'>('routing');
  
  // Rule creation states
  const [isAddingRoutingRule, setIsAddingRoutingRule] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleConditionType, setNewRuleConditionType] = useState<FleetRoutingRule['conditionType']>('topic_keyword');
  const [newRuleConditionValue, setNewRuleConditionValue] = useState('');
  const [newRuleTargetFleet, setNewRuleTargetFleet] = useState(fleets[0]?.id || 'fleet-alpha-core');
  const [newRuleTargetAgent, setNewRuleTargetAgent] = useState('');
  const [newRuleFallbackFleet, setNewRuleFallbackFleet] = useState('fleet-alpha-core');
  const [newRuleAction, setNewRuleAction] = useState<FleetRoutingRule['action']>('ROUTE_IMMEDIATE');
  const [newRuleDesc, setNewRuleDesc] = useState('');

  // Handoff rule creation states
  const [isAddingHandoffRule, setIsAddingHandoffRule] = useState(false);
  const [newHandoffName, setNewHandoffName] = useState('');
  const [newHandoffTriggerType, setNewHandoffTriggerType] = useState<FleetHandoffRule['triggerType']>('confidence_threshold');
  const [newHandoffOperator, setNewHandoffOperator] = useState<FleetHandoffRule['triggerOperator']>('<');
  const [newHandoffThreshold, setNewHandoffThreshold] = useState<number>(0.75);
  const [newHandoffSourceFleet, setNewHandoffSourceFleet] = useState('ALL_FLEETS');
  const [newHandoffTargetFleet, setNewHandoffTargetFleet] = useState(fleets[0]?.id || 'fleet-alpha-core');
  const [newHandoffContextMode, setNewHandoffContextMode] = useState<FleetHandoffRule['contextPreservation']>('full_tokens');
  const [newHandoffRequireApproval, setNewHandoffRequireApproval] = useState(false);
  const [newHandoffTimeout, setNewHandoffTimeout] = useState(10);
  const [newHandoffDesc, setNewHandoffDesc] = useState('');

  // Simulator states
  const [simPrompt, setSimPrompt] = useState('Critical: Audit smart contract auth logic for CVE reentrancy vectors before mainnet deployment');
  const [simPriority, setSimPriority] = useState<'P1' | 'P2' | 'P3'>('P1');
  const [simConfidence, setSimConfidence] = useState<number>(0.68);
  const [simContextPct, setSimContextPct] = useState<number>(45);
  const [simResult, setSimResult] = useState<{
    matchedRule: FleetRoutingRule | null;
    dispatchedFleet: string;
    dispatchedAgent: string;
    triggeredHandoff: FleetHandoffRule | null;
    resolutionPath: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleCreateRoutingRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRuleConditionValue.trim()) {
      showToast('Please provide a rule name and condition value');
      return;
    }

    const newRule: FleetRoutingRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName.trim(),
      enabled: true,
      priority: routingConfig.routingRules.length + 1,
      conditionType: newRuleConditionType,
      conditionValue: newRuleConditionValue.trim(),
      targetFleetId: newRuleTargetFleet,
      targetAgentId: newRuleTargetAgent || undefined,
      fallbackFleetId: newRuleFallbackFleet,
      action: newRuleAction,
      description: newRuleDesc.trim() || 'Custom operator defined routing rule.'
    };

    addRoutingRule(newRule);
    setIsAddingRoutingRule(false);
    setNewRuleName('');
    setNewRuleConditionValue('');
    setNewRuleDesc('');
  };

  const handleCreateHandoffRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandoffName.trim()) {
      showToast('Please provide a handoff rule name');
      return;
    }

    const unitMap: Record<FleetHandoffRule['triggerType'], string> = {
      confidence_threshold: 'confidence score',
      context_exhaustion: '% context consumed',
      error_retry_limit: 'consecutive errors',
      permission_escalation: 'permission level',
      sla_breach_warning: 'seconds to breach'
    };

    const newRule: FleetHandoffRule = {
      id: `handoff-${Date.now()}`,
      name: newHandoffName.trim(),
      enabled: true,
      triggerType: newHandoffTriggerType,
      triggerOperator: newHandoffOperator,
      triggerThreshold: Number(newHandoffThreshold),
      unitLabel: unitMap[newHandoffTriggerType],
      sourceFleetId: newHandoffSourceFleet,
      targetFleetId: newHandoffTargetFleet,
      contextPreservation: newHandoffContextMode,
      humanApprovalRequired: newHandoffRequireApproval,
      autoAckTimeoutSec: Number(newHandoffTimeout),
      description: newHandoffDesc.trim() || 'Autonomous cross-fleet handoff trigger.'
    };

    addHandoffRule(newRule);
    setIsAddingHandoffRule(false);
    setNewHandoffName('');
    setNewHandoffDesc('');
  };

  const runSimulation = () => {
    const promptLower = simPrompt.toLowerCase();
    
    // 1. Evaluate Routing Rules in priority order
    let matchedRule: FleetRoutingRule | null = null;
    const activeRules = [...routingConfig.routingRules].filter(r => r.enabled).sort((a, b) => a.priority - b.priority);

    for (const rule of activeRules) {
      if (rule.conditionType === 'priority_level') {
        if (rule.conditionValue.toUpperCase() === simPriority) {
          matchedRule = rule;
          break;
        }
      } else if (rule.conditionType === 'topic_keyword') {
        const keywords = rule.conditionValue.split(',').map(k => k.trim().toLowerCase());
        const hasMatch = keywords.some(k => k && promptLower.includes(k));
        if (hasMatch) {
          matchedRule = rule;
          break;
        }
      }
    }

    const targetFleetId = matchedRule ? matchedRule.targetFleetId : routingConfig.fallbackFleetId;
    const fleetObj = fleets.find(f => f.id === targetFleetId) || fleets[0];
    const candidateAgents = agents.filter(a => (a.fleetId || 'fleet-alpha-core') === targetFleetId);
    const assignedAgent = (matchedRule?.targetAgentId && candidateAgents.find(a => a.id === matchedRule.targetAgentId))
      ? matchedRule.targetAgentId
      : (candidateAgents[0]?.name || 'Hermes Prime');

    // 2. Evaluate Handoff Rules
    let triggeredHandoff: FleetHandoffRule | null = null;
    const activeHandoffs = routingConfig.handoffRules.filter(h => h.enabled);

    for (const h of activeHandoffs) {
      if (h.sourceFleetId !== 'ALL_FLEETS' && h.sourceFleetId !== targetFleetId) continue;

      if (h.triggerType === 'confidence_threshold') {
        if (h.triggerOperator === '<' && simConfidence < h.triggerThreshold) {
          triggeredHandoff = h;
          break;
        }
      } else if (h.triggerType === 'context_exhaustion') {
        if (h.triggerOperator === '>=' && simContextPct >= h.triggerThreshold) {
          triggeredHandoff = h;
          break;
        }
      }
    }

    const resolutionPath: string[] = [
      `1. Task Ingested: Priority [${simPriority}]`,
      matchedRule 
        ? `2. Matched Routing Rule: "${matchedRule.name}" (Action: ${matchedRule.action})`
        : `2. No specific rule triggered -> Applied default strategy [${routingConfig.defaultStrategy}] to Fallback [${targetFleetId}]`,
      `3. Dispatched to Fleet [${fleetObj?.codename || targetFleetId}] -> Candidate Agent [${assignedAgent}]`
    ];

    if (triggeredHandoff) {
      const handoffFleet = fleets.find(f => f.id === triggeredHandoff.targetFleetId)?.codename || triggeredHandoff.targetFleetId;
      resolutionPath.push(
        `4. Autonomous Handoff Tripped: "${triggeredHandoff.name}" (${triggeredHandoff.triggerType} ${triggeredHandoff.triggerOperator} ${triggeredHandoff.triggerThreshold})`,
        `5. Re-delegated to Target Fleet [${handoffFleet}] with Context Mode: [${triggeredHandoff.contextPreservation}]`
      );
    } else {
      resolutionPath.push(`4. Status: Direct execution optimal. Zero cross-fleet handoffs tripped.`);
    }

    setSimResult({
      matchedRule,
      dispatchedFleet: fleetObj?.name || targetFleetId,
      dispatchedAgent: typeof assignedAgent === 'string' ? assignedAgent : 'Hermes Prime',
      triggeredHandoff,
      resolutionPath
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0b0f19] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden text-slate-100 font-sans">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 shadow-[0_0_15px_rgba(76,215,246,0.2)]">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white tracking-tight">Fleet Routing & Handoff Settings</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 font-medium">
                  SWARM MATRIX v4.2
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Configure intent dispatch affinities, cross-fleet escalation policies, and threshold triggers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/[0.08] bg-black/30 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('routing')}
            className={`pb-3 px-3.5 font-medium border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'routing'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Routing Rules ({routingConfig.routingRules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('handoff')}
            className={`pb-3 px-3.5 font-medium border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'handoff'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Handoff & Circuit Breakers ({routingConfig.handoffRules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`pb-3 px-3.5 font-medium border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'simulator'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Rule Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3.5 font-medium border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Global Topology Config</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: ROUTING RULES */}
          {activeTab === 'routing' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Active Intent & Workload Routing Rules</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Tasks are inspected on ingest and dispatched to partitioned fleets based on condition priority.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingRoutingRule(!isAddingRoutingRule)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-semibold transition-all cursor-pointer shadow-[0_0_12px_rgba(76,215,246,0.15)]"
                  type="button"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingRoutingRule ? 'Cancel Form' : 'Add Routing Rule'}</span>
                </button>
              </div>

              {/* Add Routing Rule Inline Form */}
              {isAddingRoutingRule && (
                <form onSubmit={handleCreateRoutingRule} className="p-5 rounded-xl bg-white/[0.03] border border-cyan-400/30 font-mono text-xs space-y-4 animate-in fade-in duration-150">
                  <div className="text-cyan-300 font-semibold text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Define New Swarm Routing Rule</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">RULE NAME</label>
                      <input
                        value={newRuleName}
                        onChange={e => setNewRuleName(e.target.value)}
                        placeholder="e.g. Mathematical Proofs & Theory"
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">CONDITION TYPE</label>
                      <select
                        value={newRuleConditionType}
                        onChange={e => setNewRuleConditionType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-[#141b28] border border-white/10 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="topic_keyword">Topic / Keyword Match</option>
                        <option value="priority_level">Priority Level (P1/P2/P3)</option>
                        <option value="token_budget">Token Budget Threshold</option>
                        <option value="task_type">Task Classification Type</option>
                        <option value="model_affinity">Model Architecture Affinity</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">CONDITION MATCH VALUES (comma separated)</label>
                      <input
                        value={newRuleConditionValue}
                        onChange={e => setNewRuleConditionValue(e.target.value)}
                        placeholder="e.g. proof, calculus, theorem, latex, math"
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">TARGET FLEET PARTITION</label>
                      <select
                        value={newRuleTargetFleet}
                        onChange={e => setNewRuleTargetFleet(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#141b28] border border-white/10 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        {fleets.map(f => (
                          <option key={f.id} value={f.id}>{f.name} ({f.codename})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">DISPATCH ACTION</label>
                      <select
                        value={newRuleAction}
                        onChange={e => setNewRuleAction(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-[#141b28] border border-white/10 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="ROUTE_IMMEDIATE">ROUTE_IMMEDIATE (Autonomous execution)</option>
                        <option value="ROUTE_WITH_CONFIRM">ROUTE_WITH_CONFIRM (Notify Operator)</option>
                        <option value="DELEGATE_SUPERVISED">DELEGATE_SUPERVISED (Quorum oversight)</option>
                        <option value="FORK_PARALLEL">FORK_PARALLEL (Fan out to all workers)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">DESCRIPTION / RATIONALE</label>
                      <input
                        value={newRuleDesc}
                        onChange={e => setNewRuleDesc(e.target.value)}
                        placeholder="Brief summary of why this rule routes to this fleet"
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingRoutingRule(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition-colors cursor-pointer"
                    >
                      Save Rule
                    </button>
                  </div>
                </form>
              )}

              {/* Rules List */}
              <div className="space-y-3 font-mono text-xs">
                {routingConfig.routingRules.map((rule, idx) => {
                  const targetFleet = fleets.find(f => f.id === rule.targetFleetId);

                  return (
                    <div
                      key={rule.id}
                      className={`p-4 rounded-xl border transition-all ${
                        rule.enabled
                          ? 'bg-white/[0.02] border-white/10 hover:border-cyan-400/40'
                          : 'bg-white/[0.01] border-white/[0.04] opacity-60'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-[10px] text-slate-400 font-bold shrink-0 mt-0.5">
                            #{rule.priority || idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-xs">{rule.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 font-medium">
                                {rule.conditionType.toUpperCase()}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] bg-purple-400/10 text-purple-300 border border-purple-400/20">
                                {rule.action}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 font-sans">
                              {rule.description}
                            </p>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            onClick={() => updateRoutingRule(rule.id, { enabled: !rule.enabled })}
                            className={`px-3 py-1 rounded-lg border font-semibold text-[11px] transition-colors cursor-pointer ${
                              rule.enabled
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-white/[0.04] text-slate-500 border-white/10'
                            }`}
                            type="button"
                          >
                            {rule.enabled ? 'Active' : 'Disabled'}
                          </button>

                          <button
                            onClick={() => deleteRoutingRule(rule.id)}
                            className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-white/10 transition-colors cursor-pointer"
                            type="button"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Rule Specifics Footnote */}
                      <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Condition:</span>
                          <span className="text-amber-300 font-mono bg-black/40 px-2 py-0.5 rounded">
                            {rule.conditionValue}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Target Fleet:</span>
                          <span className="text-cyan-300 font-semibold">
                            {targetFleet ? targetFleet.codename : rule.targetFleetId}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: HANDOFF & CIRCUIT BREAKERS */}
          {activeTab === 'handoff' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Dynamic Handoff & Failure Circuit Breakers</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    When runtime conditions breach threshold parameters, tasks are automatically handed off with preserved state.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingHandoffRule(!isAddingHandoffRule)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-400/40 text-xs font-mono font-semibold transition-all cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                  type="button"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingHandoffRule ? 'Cancel Form' : 'Add Handoff Rule'}</span>
                </button>
              </div>

              {/* Add Handoff Form */}
              {isAddingHandoffRule && (
                <form onSubmit={handleCreateHandoffRule} className="p-5 rounded-xl bg-white/[0.03] border border-purple-400/30 font-mono text-xs space-y-4 animate-in fade-in duration-150">
                  <div className="text-purple-300 font-semibold text-xs flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                    <span>Define Cross-Fleet Handoff Trigger</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">TRIGGER NAME</label>
                      <input
                        value={newHandoffName}
                        onChange={e => setNewHandoffName(e.target.value)}
                        placeholder="e.g. Memory Spillover Handoff"
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">TRIGGER TYPE</label>
                      <select
                        value={newHandoffTriggerType}
                        onChange={e => setNewHandoffTriggerType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-[#141b28] border border-white/10 text-white focus:outline-none focus:border-purple-400 cursor-pointer"
                      >
                        <option value="confidence_threshold">Confidence Threshold Score</option>
                        <option value="context_exhaustion">Context Window Saturation (%)</option>
                        <option value="error_retry_limit">Consecutive Tool Error Limit</option>
                        <option value="sla_breach_warning">SLA Breach Warning (Seconds Remaining)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">OPERATOR</label>
                        <select
                          value={newHandoffOperator}
                          onChange={e => setNewHandoffOperator(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg bg-[#141b28] border border-white/10 text-white focus:outline-none focus:border-purple-400 cursor-pointer"
                        >
                          <option value="<">Less than (&lt;)</option>
                          <option value=">=">Greater or equal (&gt;=)</option>
                          <option value=">">Greater than (&gt;)</option>
                          <option value="==">Exact match (==)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">THRESHOLD VALUE</label>
                        <input
                          type="number"
                          step="any"
                          value={newHandoffThreshold}
                          onChange={e => setNewHandoffThreshold(parseFloat(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">TARGET ESCALATION FLEET</label>
                      <select
                        value={newHandoffTargetFleet}
                        onChange={e => setNewHandoffTargetFleet(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#141b28] border border-white/10 text-white focus:outline-none focus:border-purple-400 cursor-pointer"
                      >
                        {fleets.map(f => (
                          <option key={f.id} value={f.id}>{f.name} ({f.codename})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">CONTEXT PRESERVATION STRATEGY</label>
                      <select
                        value={newHandoffContextMode}
                        onChange={e => setNewHandoffContextMode(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-[#141b28] border border-white/10 text-white focus:outline-none focus:border-purple-400 cursor-pointer"
                      >
                        <option value="full_tokens">Full Token Transcript (Zero loss)</option>
                        <option value="summarized_kv">Summarized KV-Cache (Compacted)</option>
                        <option value="state_machine_only">State Machine & Variables Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">OPERATOR APPROVAL REQUIRED?</label>
                      <div className="flex items-center gap-3 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newHandoffRequireApproval}
                            onChange={e => setNewHandoffRequireApproval(e.target.checked)}
                            className="rounded border-white/20 bg-black text-purple-400"
                          />
                          <span className="text-slate-300">Require Human Approval</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingHandoffRule(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-purple-400 text-black font-bold hover:bg-purple-300 transition-colors cursor-pointer"
                    >
                      Save Handoff Rule
                    </button>
                  </div>
                </form>
              )}

              {/* Handoff Rules List */}
              <div className="space-y-3 font-mono text-xs">
                {routingConfig.handoffRules.map((rule) => {
                  const targetFleet = fleets.find(f => f.id === rule.targetFleetId);

                  return (
                    <div
                      key={rule.id}
                      className={`p-4 rounded-xl border transition-all ${
                        rule.enabled
                          ? 'bg-white/[0.02] border-white/10 hover:border-purple-400/40'
                          : 'bg-white/[0.01] border-white/[0.04] opacity-60'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-xs">{rule.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-400/10 text-purple-300 border border-purple-400/20 font-medium">
                              {rule.triggerType} {rule.triggerOperator} {rule.triggerThreshold}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-white/[0.06] text-slate-300 border border-white/10">
                              Context: {rule.contextPreservation}
                            </span>
                            {rule.humanApprovalRequired && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/10 text-amber-300 border border-amber-400/20">
                                Human Gate
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 font-sans">
                            {rule.description}
                          </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            onClick={() => updateHandoffRule(rule.id, { enabled: !rule.enabled })}
                            className={`px-3 py-1 rounded-lg border font-semibold text-[11px] transition-colors cursor-pointer ${
                              rule.enabled
                                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                : 'bg-white/[0.04] text-slate-500 border-white/10'
                            }`}
                            type="button"
                          >
                            {rule.enabled ? 'Active' : 'Disabled'}
                          </button>

                          <button
                            onClick={() => deleteHandoffRule(rule.id)}
                            className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-white/10 transition-colors cursor-pointer"
                            type="button"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                        <span>Source: <strong className="text-slate-300">{rule.sourceFleetId}</strong></span>
                        <span>Target: <strong className="text-cyan-300">{targetFleet?.codename || rule.targetFleetId}</strong></span>
                        <span>Auto-Ack: <strong className="text-slate-300">{rule.autoAckTimeoutSec}s</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-white">Live Fleet Routing Test Bench & Resolution Tracer</h4>
                <p className="text-xs text-slate-400 font-mono">
                  Enter an arbitrary task description to simulate how the Hermes swarm routes it across fleets and tests handoff triggers.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Simulator Inputs (5 cols) */}
                <div className="lg:col-span-5 p-5 rounded-2xl bg-white/[0.02] border border-white/10 font-mono text-xs space-y-4">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">TEST TASK INSTRUCTION / PROMPT</label>
                    <textarea
                      value={simPrompt}
                      onChange={e => setSimPrompt(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-400 resize-none text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(['P1', 'P2', 'P3'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSimPriority(p)}
                        className={`py-2 rounded-lg font-bold border transition-colors cursor-pointer ${
                          simPriority === p
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                            : 'bg-white/[0.02] text-slate-400 border-white/10'
                        }`}
                      >
                        Priority {p}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">SIMULATED AGENT CONFIDENCE</span>
                      <span className="text-cyan-300 font-bold">{(simConfidence * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.30"
                      max="1.0"
                      step="0.01"
                      value={simConfidence}
                      onChange={e => setSimConfidence(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">CONTEXT CONSUMPTION %</span>
                      <span className="text-purple-300 font-bold">{simContextPct}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="1"
                      value={simContextPct}
                      onChange={e => setSimContextPct(parseInt(e.target.value))}
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={runSimulation}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-black font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(76,215,246,0.3)] hover:opacity-90 transition-opacity cursor-pointer text-xs"
                    type="button"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Evaluate Routing & Handoffs</span>
                  </button>
                </div>

                {/* Simulation Output (7 cols) */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                      <div className="flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <span className="text-cyan-400 font-bold">RESOLUTION ENGINE TRACE</span>
                      </div>
                      <span className="text-[10px] text-slate-500">REALTIME MATRIX EVAL</span>
                    </div>

                    {simResult ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                            <span className="text-[10px] text-slate-500 block mb-1">RESOLVED FLEET</span>
                            <span className="text-sm font-bold text-cyan-300">{simResult.dispatchedFleet}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                            <span className="text-[10px] text-slate-500 block mb-1">TARGET WORKER</span>
                            <span className="text-sm font-bold text-white">{simResult.dispatchedAgent}</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wide block">EXECUTION TRACE LOG:</span>
                          {simResult.resolutionPath.map((step, idx) => (
                            <div key={idx} className="text-slate-300 text-[11px] flex items-start gap-2">
                              <span className="text-cyan-400">›</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                        <Compass className="w-8 h-8 text-slate-600 animate-spin" />
                        <p className="text-xs">Adjust test parameters and click Evaluate Routing to trace the swarm dispatch path.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Active Rules Loaded: {routingConfig.routingRules.length}</span>
                    <span>Handoff Triggers: {routingConfig.handoffRules.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GLOBAL TOPOLOGY SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 font-mono text-xs">
              <div>
                <h4 className="text-sm font-semibold text-white">Global Dispatch & Handoff Topology</h4>
                <p className="text-xs text-slate-400">
                  Cluster-wide defaults applied when tasks do not match specific keyword or priority rules.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Default Strategy */}
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                  <label className="text-slate-300 font-bold block text-xs">DEFAULT DISPATCH STRATEGY</label>
                  <p className="text-slate-400 text-[11px] font-sans">
                    Strategy used when no explicit keyword or priority conditions match.
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: 'intent-affinity', name: 'Intent Affinity (Neural Classifier)' },
                      { id: 'least-loaded', name: 'Least-Loaded (Lowest VRAM & Active Tasks)' },
                      { id: 'round-robin', name: 'Round-Robin (Equal Swarm Dispersion)' },
                      { id: 'priority-urgency', name: 'Priority-Urgency (P1 Hot Queue)' },
                      { id: 'context-window-fit', name: 'Context Window Fit (Memory Adaptive)' }
                    ].map(strat => (
                      <button
                        key={strat.id}
                        type="button"
                        onClick={() => updateRoutingConfig({ defaultStrategy: strat.id as RoutingStrategy })}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          routingConfig.defaultStrategy === strat.id
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40 font-semibold'
                            : 'bg-white/[0.02] text-slate-400 hover:text-white border-white/[0.06]'
                        }`}
                      >
                        <span>{strat.name}</span>
                        {routingConfig.defaultStrategy === strat.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Handoff Global Boundaries */}
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
                  <label className="text-slate-300 font-bold block text-xs">GLOBAL HANDOFF BOUNDARIES</label>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">FALLBACK SAFETY FLEET</label>
                    <select
                      value={routingConfig.fallbackFleetId}
                      onChange={e => updateRoutingConfig({ fallbackFleetId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#141b28] border border-white/10 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {fleets.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.codename})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">MAX HANDOFF HOPS ALLOWED</span>
                      <span className="text-cyan-300 font-bold">{routingConfig.maxHandoffHops} Hops</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={routingConfig.maxHandoffHops}
                      onChange={e => updateRoutingConfig({ maxHandoffHops: parseInt(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 font-sans">
                      Prevents infinite ping-pong loops between specialized swarms.
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-slate-300">Allow Cross-Fleet Autonomous Handoffs</span>
                      <input
                        type="checkbox"
                        checked={routingConfig.enableCrossFleetHandoffs}
                        onChange={e => updateRoutingConfig({ enableCrossFleetHandoffs: e.target.checked })}
                        className="rounded border-white/20 bg-black text-cyan-400 w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-slate-300">Auto-Escalate on P1 Emergencies</span>
                      <input
                        type="checkbox"
                        checked={routingConfig.autoEscalateOnP1}
                        onChange={e => updateRoutingConfig({ autoEscalateOnP1: e.target.checked })}
                        className="rounded border-white/20 bg-black text-cyan-400 w-4 h-4"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Active Rules Persisted to Local Server Storage</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(76,215,246,0.2)]"
            type="button"
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
