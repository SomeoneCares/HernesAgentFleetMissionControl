import React, { useState } from 'react';
import { TaskItem } from '../types';
import { X, CheckSquare, AlertCircle } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: TaskItem) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'P1 · CRITICAL' | 'P2 · ELEVATED' | 'P3 · NORMAL'>('P2 · ELEVATED');
  const [assignedAgent, setAssignedAgent] = useState('CodeSynthesizer');
  const [tags, setTags] = useState('#INFRA, #HERMES');
  const [subtasksCount, setSubtasksCount] = useState(3);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const hashHex = Math.random().toString(16).substring(2, 10).toUpperCase();

    const priorityLevel = priority.startsWith('P1') ? 'P1' : priority.startsWith('P2') ? 'P2' : 'P3';

    let agentTag: 'Dev' | 'Orchestrator' | 'Scout' | 'OpsSentry' | 'Security' = 'Dev';
    if (assignedAgent.includes('Orchestrator') || assignedAgent.includes('Prime')) agentTag = 'Orchestrator';
    else if (assignedAgent.includes('Research') || assignedAgent.includes('Oracle')) agentTag = 'Scout';
    else if (assignedAgent.includes('Ops')) agentTag = 'OpsSentry';
    else if (assignedAgent.includes('Security')) agentTag = 'Security';

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      hash: hashHex,
      title: title.trim(),
      column: 'todo',
      priority,
      priorityLevel,
      assignedAgent,
      agentTag,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      subtasksCompleted: 0,
      subtasksTotal: subtasksCount,
      slaText: 'Est. 45m',
      slaType: 'time'
    };

    onCreate(newTask);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0e1320] border border-white/[0.14] p-6 shadow-2xl font-mono text-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white tracking-wide">NEW MISSION DISPATCH</h3>
              <p className="text-[11px] text-slate-400">Create an autonomous task execution ticket</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1.5 uppercase font-medium">Mission Objective / Task Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Profile distributed KV attention weights on GPU cluster..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white focus:border-cyan-400 focus:outline-none text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5 uppercase font-medium">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#141b2b] border border-white/[0.1] text-white focus:border-cyan-400 focus:outline-none text-xs"
              >
                <option value="P1 · CRITICAL">P1 · CRITICAL</option>
                <option value="P2 · ELEVATED">P2 · ELEVATED</option>
                <option value="P3 · NORMAL">P3 · NORMAL</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5 uppercase font-medium">Assigned Agent</label>
              <select
                value={assignedAgent}
                onChange={(e) => setAssignedAgent(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#141b2b] border border-white/[0.1] text-white focus:border-cyan-400 focus:outline-none text-xs"
              >
                <option value="Hermes Prime (Orchestrator)">Hermes Prime (Orchestrator)</option>
                <option value="CodeSynthesizer (Developer)">CodeSynthesizer (Developer)</option>
                <option value="ResearchOracle (Telemetry Scout)">ResearchOracle (Scout)</option>
                <option value="OpsSentry (Infra Watchdog)">OpsSentry (Infra Watchdog)</option>
                <option value="DataWeaver (Relational Engineer)">DataWeaver (Relational Engineer)</option>
                <option value="SecuritySentinel (Redact & Guard)">SecuritySentinel (Security)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1.5 uppercase font-medium">Tags (Comma Separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="#VLLM, #CUDA, #SECURITY"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white focus:border-cyan-400 focus:outline-none text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1.5 uppercase font-medium">Subtasks Quantity</label>
            <input
              type="number"
              min={1}
              max={10}
              value={subtasksCount}
              onChange={(e) => setSubtasksCount(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white focus:border-cyan-400 focus:outline-none text-xs"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.02] border border-white/[0.08]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-[#07090e] font-bold shadow-[0_0_15px_rgba(76,215,246,0.3)] hover:opacity-95 cursor-pointer"
            >
              Dispatch Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
