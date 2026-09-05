import React, { useState, useMemo } from 'react';
import { Agent, AgentMemoryItem } from '../types';
import { getAgentMemories } from '../data/agentMemorySoulData';
import { 
  X, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  HardDrive, 
  Tag, 
  Clock, 
  Sparkles, 
  Check, 
  Sliders, 
  Copy, 
  Save, 
  RotateCcw,
  BookOpen,
  Layers,
  Database,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface AgentMemoryModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveMemories: (agentId: string, updatedMemories: AgentMemoryItem[]) => void;
}

type MemoryCategory = 'All' | 'Core Principles' | 'Episodic Experience' | 'Procedural Knowledge' | 'Working Context' | 'Factoid & System';

export const AgentMemoryModal: React.FC<AgentMemoryModalProps> = ({
  agent,
  isOpen,
  onClose,
  onSaveMemories
}) => {
  if (!isOpen || !agent) return null;

  // Local state initialized from agent
  const initialMemories = useMemo(() => {
    return getAgentMemories(agent.id, agent.memories);
  }, [agent.id, agent.memories]);

  const [memories, setMemories] = useState<AgentMemoryItem[]>(initialMemories);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory>('All');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Memory Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AgentMemoryItem['category']>('Core Principles');
  const [newContent, setNewContent] = useState('');
  const [newImportance, setNewImportance] = useState(0.85);
  const [newTags, setNewTags] = useState('');

  // Editing Memory Form State
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<AgentMemoryItem['category']>('Core Principles');
  const [editContent, setEditContent] = useState('');
  const [editImportance, setEditImportance] = useState(0.85);
  const [editTags, setEditTags] = useState('');

  // Filter memories based on search query and category
  const filteredMemories = useMemo(() => {
    return memories.filter(mem => {
      const matchesCategory = selectedCategory === 'All' || mem.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        mem.title.toLowerCase().includes(q) ||
        mem.content.toLowerCase().includes(q) ||
        mem.category.toLowerCase().includes(q) ||
        mem.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [memories, selectedCategory, searchQuery]);

  // Total Token Count
  const totalTokens = useMemo(() => {
    return memories.reduce((acc, m) => acc + (m.tokenCount || 0), 0);
  }, [memories]);

  // Average weight
  const avgImportance = useMemo(() => {
    if (memories.length === 0) return 0;
    const sum = memories.reduce((acc, m) => acc + m.importance, 0);
    return (sum / memories.length).toFixed(2);
  }, [memories]);

  // Handle Add New Memory
  const handleAddNewMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tagsArray = newTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const tokenEst = Math.round(newContent.length / 3.8);

    const newItem: AgentMemoryItem = {
      id: `mem-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      importance: newImportance,
      tokenCount: tokenEst,
      lastAccessed: 'Just now',
      tags: tagsArray.length > 0 ? tagsArray : ['custom', 'runtime']
    };

    const updated = [newItem, ...memories];
    setMemories(updated);
    onSaveMemories(agent.id, updated);

    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setNewImportance(0.85);
    setIsAddingNew(false);
  };

  // Start editing memory
  const handleStartEdit = (mem: AgentMemoryItem) => {
    setEditingMemoryId(mem.id);
    setEditTitle(mem.title);
    setEditCategory(mem.category);
    setEditContent(mem.content);
    setEditImportance(mem.importance);
    setEditTags(mem.tags.join(', '));
  };

  // Save edited memory
  const handleSaveEdit = (id: string) => {
    const tagsArray = editTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const updated = memories.map(m => {
      if (m.id === id) {
        return {
          ...m,
          title: editTitle.trim(),
          category: editCategory,
          content: editContent.trim(),
          importance: editImportance,
          tokenCount: Math.round(editContent.length / 3.8),
          tags: tagsArray
        };
      }
      return m;
    });

    setMemories(updated);
    onSaveMemories(agent.id, updated);
    setEditingMemoryId(null);
  };

  // Delete memory
  const handleDelete = (id: string) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    onSaveMemories(agent.id, updated);
  };

  // Copy memory text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper for category badge color
  const getCategoryBadge = (category: AgentMemoryItem['category']) => {
    switch (category) {
      case 'Core Principles':
        return 'bg-cyan-400/10 text-cyan-300 border-cyan-400/25';
      case 'Episodic Experience':
        return 'bg-purple-400/10 text-purple-300 border-purple-400/25';
      case 'Procedural Knowledge':
        return 'bg-emerald-400/10 text-emerald-300 border-emerald-400/25';
      case 'Working Context':
        return 'bg-amber-400/10 text-amber-300 border-amber-400/25';
      case 'Factoid & System':
        return 'bg-blue-400/10 text-blue-300 border-blue-400/25';
      default:
        return 'bg-white/[0.05] text-slate-300 border-white/[0.1]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn font-mono text-xs">
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#0b0f19] border border-white/[0.14] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0e1422] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white tracking-tight">
                  ACTIVE MEMORY REPOSITORY // {agent.name}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-400/10 text-purple-300 border border-purple-400/20 font-semibold">
                  {agent.codename}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                  NO JSON • LIVE REPOSITORY
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-normal mt-0.5 flex items-center gap-2">
                <span>{agent.role}</span>
                <span>•</span>
                <span className="text-cyan-400">{memories.length} Active Records</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/30 font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingNew ? 'Close Form' : 'Add Memory'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="px-6 py-2.5 bg-[#080b12] border-b border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[10px]">MEMORIES COUNT</span>
              <span className="text-white font-bold">{memories.length} Verified Entries</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[10px]">VECTOR TOKEN LOAD</span>
              <span className="text-purple-300 font-bold">{totalTokens.toLocaleString()} Tokens</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[10px]">AVG RELEVANCE WEIGHT</span>
              <span className="text-amber-300 font-bold">{avgImportance} / 1.00</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[10px]">CACHE RESIDENCY</span>
              <span className="text-emerald-300 font-bold">GPU HBM3 Vector RAG</span>
            </div>
          </div>
        </div>

        {/* Search Bar & Category Filter Tabs */}
        <div className="px-6 py-3.5 bg-[#0e1320] border-b border-white/[0.06] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories by keyword, topic, or tag..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#090d16] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {(['All', 'Core Principles', 'Episodic Experience', 'Procedural Knowledge', 'Working Context', 'Factoid & System'] as MemoryCategory[]).map((cat) => {
              const count = cat === 'All' 
                ? memories.length 
                : memories.filter(m => m.category === cat).length;

              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-purple-400/20 text-purple-200 font-bold' : 'bg-white/[0.05] text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* New Memory Drawer Form */}
        {isAddingNew && (
          <form onSubmit={handleAddNewMemory} className="p-5 bg-[#121827] border-b border-cyan-400/30 shrink-0 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                CREATE NEW NEURAL MEMORY ENTRY
              </span>
              <span className="text-[11px] text-slate-400">Direct injection into agent vector state</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-400 block mb-1">MEMORY TITLE / TOPIC</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Cache Eviction Policy & Rate Limit Fallback"
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-[#090d16] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">CATEGORY</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as AgentMemoryItem['category'])}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#090d16] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Core Principles">Core Principles</option>
                  <option value="Episodic Experience">Episodic Experience</option>
                  <option value="Procedural Knowledge">Procedural Knowledge</option>
                  <option value="Working Context">Working Context</option>
                  <option value="Factoid & System">Factoid & System</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">MEMORY CONTENT & LESSONS</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Enter exact operational heuristic, episodic memory, or knowledge rule..."
                required
                rows={3}
                className="w-full p-3 rounded-lg bg-[#090d16] border border-white/[0.1] text-xs text-white leading-relaxed focus:outline-none focus:border-cyan-400 resize-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  IMPORTANCE WEIGHT: <span className="text-cyan-400 font-bold">{newImportance.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={newImportance}
                  onChange={(e) => setNewImportance(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">TAGS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g., vram, routing, fallback"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#090d16] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Store into Memory</span>
              </button>
            </div>
          </form>
        )}

        {/* Memories List Display */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredMemories.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 rounded-2xl bg-white/[0.01] border border-white/[0.06]">
              <Search className="w-8 h-8 text-slate-600" />
              <div className="text-slate-300 font-bold text-sm">No memory records matched your criteria</div>
              <p className="text-slate-500 text-xs max-w-sm">
                No items found for &quot;{searchQuery}&quot; under &quot;{selectedCategory}&quot;. Try adjusting your keywords or clearing the filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-cyan-400 text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredMemories.map((mem) => {
              const isEditing = editingMemoryId === mem.id;

              if (isEditing) {
                return (
                  <div key={mem.id} className="p-5 rounded-2xl bg-[#141b2b] border border-cyan-400/40 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300 text-xs flex items-center gap-2">
                        <Edit3 className="w-4 h-4" />
                        EDITING MEMORY // {mem.id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Token footprint: {Math.round(editContent.length / 3.8)}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-1">TITLE</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#090d16] border border-white/[0.15] text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">CATEGORY</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as AgentMemoryItem['category'])}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#090d16] border border-white/[0.15] text-xs text-white focus:outline-none focus:border-cyan-400"
                        >
                          <option value="Core Principles">Core Principles</option>
                          <option value="Episodic Experience">Episodic Experience</option>
                          <option value="Procedural Knowledge">Procedural Knowledge</option>
                          <option value="Working Context">Working Context</option>
                          <option value="Factoid & System">Factoid & System</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">CONTENT</label>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full p-3 rounded-lg bg-[#090d16] border border-white/[0.15] text-xs text-white leading-relaxed focus:outline-none focus:border-cyan-400 resize-none font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          IMPORTANCE WEIGHT: <span className="text-cyan-400 font-bold">{editImportance.toFixed(2)}</span>
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={editImportance}
                          onChange={(e) => setEditImportance(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">TAGS (COMMA SEPARATED)</label>
                        <input
                          type="text"
                          value={editTags}
                          onChange={(e) => setEditTags(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#090d16] border border-white/[0.15] text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingMemoryId(null)}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(mem.id)}
                        className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={mem.id}
                  className="p-5 rounded-2xl bg-[#0e1422]/90 hover:bg-[#12182a] border border-white/[0.08] hover:border-white/[0.18] transition-all group flex flex-col justify-between space-y-3"
                >
                  {/* Top Bar: Category, Importance, Tokens, Last Accessed */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(mem.category)}`}>
                        {mem.category}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 font-semibold">
                        ★ {mem.importance.toFixed(2)} Weight
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                        {mem.tokenCount} tokens
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {mem.lastAccessed}
                      </span>

                      {/* Action buttons */}
                      <button
                        type="button"
                        onClick={() => handleCopy(mem.id, mem.content)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                        title="Copy Memory Text"
                      >
                        {copiedId === mem.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(mem)}
                        className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-400/10 transition-colors"
                        title="Edit Memory"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(mem.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-white tracking-tight leading-snug group-hover:text-cyan-300 transition-colors">
                    {mem.title}
                  </h4>

                  {/* Content */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-black/30 p-3 rounded-xl border border-white/[0.04]">
                    {mem.content}
                  </p>

                  {/* Tags */}
                  {mem.tags && mem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mem.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-white/[0.03] text-slate-400 border border-white/[0.06]"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-500" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-[#0e1422] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Vector memory synchronized with GPU VRAM cache index</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
