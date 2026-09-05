import React, { useState } from 'react';
import { TaskItem } from '../types';
import { useCluster } from '../context/ClusterContext';
import { NewTaskModal } from './NewTaskModal';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Flame, 
  ArrowRight, 
  ArrowLeft, 
  SlidersHorizontal,
  Bot,
  GripVertical,
  Move,
  Activity,
  Zap,
  Info
} from 'lucide-react';

export const TasksTab: React.FC = () => {
  const { tasks, moveTask, createTask, agents } = useCluster();
  const [searchQuery, setSearchQuery] = useState('');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<'todo' | 'inprogress' | 'done' | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.assignedAgent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAgent = agentFilter === 'ALL' || t.agentTag.toLowerCase() === agentFilter.toLowerCase();
    return matchesSearch && matchesAgent;
  });

  const todoTasks = filteredTasks.filter(t => t.column === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.column === 'inprogress');
  const doneTasks = filteredTasks.filter(t => t.column === 'done');

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, column: 'todo' | 'inprogress' | 'done') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== column) {
      setDragOverColumn(column);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Avoid triggering leave when moving over children
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumn: 'todo' | 'inprogress' | 'done') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTask(taskId, targetColumn);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleCreateTask = (newTask: TaskItem) => {
    createTask(newTask);
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-14">
      {/* 1. TOP HEADER & FILTER BAR */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#4cd7f6]" />
            <span className="font-mono text-xs tracking-widest text-cyan-400 uppercase font-medium">
              MISSION CONTROL // KANBAN BUS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white">Autonomous Task Board</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 text-[11px] font-mono flex items-center gap-1.5">
              <Move className="w-3 h-3 text-cyan-400" />
              <span>Drag & Drop Enabled</span>
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by hash, title..."
              className="pl-9 pr-4 py-2 rounded-xl bg-[#101622]/80 border border-white/[0.08] focus:border-cyan-400/50 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none w-48 sm:w-64"
            />
          </div>

          {/* Filter Agent */}
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#101622]/80 border border-white/[0.08] text-xs font-mono text-slate-300 focus:border-cyan-400 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Agents</option>
            <option value="Dev">Dev Workers</option>
            <option value="Orchestrator">Orchestrator</option>
            <option value="Scout">Scout</option>
            <option value="OpsSentry">OpsSentry</option>
          </select>

          {/* New Mission Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:opacity-95 text-[#07090e] font-mono text-xs font-bold shadow-[0_0_15px_rgba(76,215,246,0.3)] transition-all flex items-center gap-2 cursor-pointer"
            type="button"
          >
            <Plus className="w-4 h-4 text-[#07090e]" />
            <span>New Mission</span>
          </button>
        </div>
      </section>

      {/* Real-time sync notification bar */}
      <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-400/20 flex items-center justify-between gap-3 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-cyan-300">Real Pipeline Reflection:</strong> Dragging a task into <strong className="text-cyan-400">IN PROGRESS</strong> automatically sets the assigned agent to <span className="text-amber-300 font-bold">BUSY</span> and spins up their execution PID. Dropping into <strong className="text-emerald-400">DONE</strong> frees up the agent to <span className="text-emerald-300 font-bold">ONLINE</span> and logs SLA verification in the live ledger.
          </span>
        </div>
      </div>

      {/* 2. KANBAN BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ===================== TO DO COLUMN ===================== */}
        <div 
          onDragOver={(e) => handleDragOver(e, 'todo')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'todo')}
          className={`flex flex-col gap-4 rounded-2xl bg-[#0b0f19]/70 backdrop-blur-xl border transition-all duration-200 p-5 ${
            dragOverColumn === 'todo'
              ? 'border-cyan-400 ring-2 ring-cyan-400/30 bg-cyan-500/[0.06] shadow-[0_0_25px_rgba(76,215,246,0.2)]'
              : 'border-white/[0.07]'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <h3 className="font-mono text-xs font-bold tracking-wider text-slate-300 uppercase">
                TO DO // QUEUED
              </h3>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 font-semibold border border-white/[0.06]">
              {todoTasks.length}
            </span>
          </div>

          {/* Drop target ghost indicator if hovering */}
          {dragOverColumn === 'todo' && (
            <div className="p-4 rounded-xl border-2 border-dashed border-cyan-400/60 bg-cyan-400/10 text-cyan-300 text-center font-mono text-xs animate-pulse">
              ⬇ Drop here to place in TO DO Backlog
            </div>
          )}

          <div className="space-y-4 min-h-[350px]">
            {todoTasks.length === 0 && dragOverColumn !== 'todo' && (
              <div className="p-8 text-center border border-dashed border-white/[0.06] rounded-xl text-slate-500 font-mono text-xs">
                No tasks in backlog. Drag tasks here or create a new mission.
              </div>
            )}

            {todoTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                className={`p-5 rounded-xl bg-[#101622]/90 border border-white/[0.08] hover:border-cyan-400/40 transition-all shadow-md group font-mono text-xs flex flex-col justify-between gap-4 cursor-grab active:cursor-grabbing select-none ${
                  draggedTaskId === task.id ? 'opacity-40 scale-[0.98] border-dashed border-cyan-400' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <GripVertical className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-[11px]">#{task.hash}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      task.priorityLevel === 'P1'
                        ? 'bg-rose-400/10 text-rose-400 border-rose-400/25'
                        : 'bg-amber-400/10 text-amber-300 border-amber-400/25'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white font-sans tracking-tight mb-2 group-hover:text-cyan-300 transition-colors">
                    {task.title}
                  </h4>

                  <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{task.assignedAgent}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {task.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] text-slate-400 border border-white/[0.05]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Subtask Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Subtasks</span>
                      <span>{task.subtasksCompleted} / {task.subtasksTotal}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${(task.subtasksCompleted / task.subtasksTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {task.slaText}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 hidden sm:inline-block">Drag card or</span>
                    <button
                      onClick={() => moveTask(task.id, 'inprogress')}
                      className="px-2.5 py-1 rounded bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 border border-cyan-400/25 transition-colors flex items-center gap-1 cursor-pointer"
                      type="button"
                    >
                      <span>Start</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===================== IN PROGRESS COLUMN ===================== */}
        <div 
          onDragOver={(e) => handleDragOver(e, 'inprogress')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'inprogress')}
          className={`flex flex-col gap-4 rounded-2xl bg-[#0b0f19]/70 backdrop-blur-xl border transition-all duration-200 p-5 shadow-[0_0_20px_rgba(76,215,246,0.06)] ${
            dragOverColumn === 'inprogress'
              ? 'border-cyan-400 ring-2 ring-cyan-400/40 bg-cyan-500/[0.08] shadow-[0_0_30px_rgba(76,215,246,0.25)]'
              : 'border-cyan-400/20'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="font-mono text-xs font-bold tracking-wider text-cyan-300 uppercase">
                IN PROGRESS // ACTIVE PIPELINES
              </h3>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-cyan-400/10 text-cyan-300 font-semibold border border-cyan-400/20">
              {inProgressTasks.length}
            </span>
          </div>

          {/* Drop target ghost indicator if hovering */}
          {dragOverColumn === 'inprogress' && (
            <div className="p-4 rounded-xl border-2 border-dashed border-cyan-400/70 bg-cyan-400/15 text-cyan-300 text-center font-mono text-xs animate-pulse">
              ⬇ Drop here to ENGAGE active agent pipeline (Agent status ➔ BUSY)
            </div>
          )}

          <div className="space-y-4 min-h-[350px]">
            {inProgressTasks.length === 0 && dragOverColumn !== 'inprogress' && (
              <div className="p-8 text-center border border-dashed border-white/[0.06] rounded-xl text-slate-500 font-mono text-xs">
                No active execution pipelines. Drag tasks here to engage agent fleet.
              </div>
            )}

            {inProgressTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                className={`p-5 rounded-xl bg-[#101622]/90 border border-white/[0.1] hover:border-cyan-400/50 transition-all shadow-md group font-mono text-xs flex flex-col justify-between gap-4 cursor-grab active:cursor-grabbing select-none ${
                  draggedTaskId === task.id ? 'opacity-40 scale-[0.98] border-dashed border-cyan-400' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <GripVertical className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-[11px]">#{task.hash}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      task.priorityLevel === 'P1'
                        ? 'bg-rose-400/10 text-rose-400 border-rose-400/25'
                        : 'bg-amber-400/10 text-amber-300 border-amber-400/25'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white font-sans tracking-tight mb-2 group-hover:text-cyan-300 transition-colors">
                    {task.title}
                  </h4>

                  <div className="text-[11px] text-slate-300 mb-3 flex items-start gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="leading-snug text-slate-400">{task.assignedAgent}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {task.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Subtask Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Progress</span>
                      <span className="text-cyan-300 font-bold">
                        {Math.round((task.subtasksCompleted / task.subtasksTotal) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full shadow-[0_0_8px_#4cd7f6]"
                        style={{ width: `${(task.subtasksCompleted / task.subtasksTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px]">
                  <span className={`flex items-center gap-1 font-semibold ${
                    task.slaType === 'fire' ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {task.slaType === 'fire' ? <Flame className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {task.slaText}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => moveTask(task.id, 'todo')}
                      className="p-1 rounded bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                      title="Back to To Do"
                      type="button"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveTask(task.id, 'done')}
                      className="px-2.5 py-1 rounded bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-300 border border-emerald-400/25 transition-colors flex items-center gap-1 cursor-pointer"
                      type="button"
                    >
                      <span>Complete</span>
                      <CheckCircle2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===================== DONE COLUMN ===================== */}
        <div 
          onDragOver={(e) => handleDragOver(e, 'done')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'done')}
          className={`flex flex-col gap-4 rounded-2xl bg-[#0b0f19]/70 backdrop-blur-xl border transition-all duration-200 p-5 ${
            dragOverColumn === 'done'
              ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-emerald-500/[0.06] shadow-[0_0_25px_rgba(78,222,163,0.2)]'
              : 'border-white/[0.07]'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="font-mono text-xs font-bold tracking-wider text-emerald-300 uppercase">
                DONE & VERIFIED
              </h3>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-emerald-400/10 text-emerald-400 font-semibold border border-emerald-400/20">
              {doneTasks.length}
            </span>
          </div>

          {/* Drop target ghost indicator if hovering */}
          {dragOverColumn === 'done' && (
            <div className="p-4 rounded-xl border-2 border-dashed border-emerald-400/70 bg-emerald-400/15 text-emerald-300 text-center font-mono text-xs animate-pulse">
              ⬇ Drop here to COMPLETE mission & RESTORE agent to ONLINE
            </div>
          )}

          <div className="space-y-4 min-h-[350px]">
            {doneTasks.length === 0 && dragOverColumn !== 'done' && (
              <div className="p-8 text-center border border-dashed border-white/[0.06] rounded-xl text-slate-500 font-mono text-xs">
                No completed missions yet. Drag finished pipelines here.
              </div>
            )}

            {doneTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                className={`p-5 rounded-xl bg-[#101622]/90 border border-white/[0.08] transition-all shadow-md font-mono text-xs flex flex-col justify-between gap-4 opacity-90 hover:opacity-100 cursor-grab active:cursor-grabbing select-none ${
                  draggedTaskId === task.id ? 'opacity-40 scale-[0.98] border-dashed border-emerald-400' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <GripVertical className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      <span className="text-[11px]">#{task.hash}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/25">
                      COMPLETED
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white font-sans tracking-tight mb-2">
                    {task.title}
                  </h4>

                  <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{task.assignedAgent}</span>
                  </div>

                  {/* Subtask Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-emerald-400">
                      <span>All subtasks finished</span>
                      <span>{task.subtasksTotal} / {task.subtasksTotal}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {task.slaText}
                  </span>
                  <button
                    onClick={() => moveTask(task.id, 'inprogress')}
                    className="p-1 rounded bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white cursor-pointer"
                    title="Re-open into In Progress"
                    type="button"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. AUTO-DISPATCH FEED TICKER (FROM MOCKUP IMAGE 9) */}
      <section className="rounded-xl bg-[#0b0f19]/80 border border-white/[0.06] p-4 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span className="text-cyan-400 font-bold uppercase tracking-wide">AUTONOMOUS ORCHESTRATION BUS:</span>
          <span className="text-slate-300">
            {inProgressTasks.length} active agent pipelines running in hardware sandboxes • {todoTasks.length} queued
          </span>
        </div>
        <span className="text-slate-500 text-[11px] shrink-0">NEXT CONSENSUS CYCLE: 00:00:38</span>
      </section>

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateTask}
      />
    </div>
  );
};
