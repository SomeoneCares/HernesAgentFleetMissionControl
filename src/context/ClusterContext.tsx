import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Agent, TaskItem, ActivityEvent, AgentMemoryItem, ModelOption } from '../types';
import { INITIAL_AGENTS, INITIAL_TASKS, INITIAL_ACTIVITY_EVENTS, AVAILABLE_MODELS } from '../data/mockData';

interface ClusterContextType {
  tasks: TaskItem[];
  agents: Agent[];
  events: ActivityEvent[];
  toast: string | null;
  moveTask: (taskId: string, targetColumn: 'todo' | 'inprogress' | 'done') => void;
  createTask: (newTask: TaskItem) => void;
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  setEvents: React.Dispatch<React.SetStateAction<ActivityEvent[]>>;
  updateAgentSoul: (agentId: string, newSoul: string) => void;
  updateAgentMemories: (agentId: string, memories: AgentMemoryItem[]) => void;
  changeAgentModel: (agentId: string, newModelId: string) => void;
  autoBalanceFleet: () => void;
  killAgentTask: (agentId: string) => void;
  deployAgent: (newAgent: Agent) => void;
  addActivityEvent: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  showToast: (msg: string) => void;
}

const ClusterContext = createContext<ClusterContextType | undefined>(undefined);

const TASKS_STORAGE_KEY = 'hermes_tasks_state_v1';
const AGENTS_STORAGE_KEY = 'hermes_agents_state_v1';

export const ClusterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize tasks from localStorage or mockData
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
    }
    return INITIAL_TASKS;
  });

  // Initialize agents from localStorage or mockData
  const [agents, setAgents] = useState<Agent[]>(() => {
    try {
      const saved = localStorage.getItem(AGENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load agents from localStorage', e);
    }
    return INITIAL_AGENTS;
  });

  const [events, setEvents] = useState<ActivityEvent[]>(INITIAL_ACTIVITY_EVENTS);
  const [toast, setToast] = useState<string | null>(null);

  // Sync tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to persist tasks', e);
    }
  }, [tasks]);

  // Sync agents to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
    } catch (e) {
      console.error('Failed to persist agents', e);
    }
  }, [agents]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Move task between stages and reflect in real agent execution state
  const moveTask = (taskId: string, targetColumn: 'todo' | 'inprogress' | 'done') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.column === targetColumn) return;

    const previousColumn = task.column;

    // 1. Calculate updated subtasks
    let updatedSubtasksCompleted = task.subtasksCompleted;
    if (targetColumn === 'done') {
      updatedSubtasksCompleted = task.subtasksTotal;
    } else if (targetColumn === 'inprogress' && task.subtasksCompleted === 0) {
      updatedSubtasksCompleted = Math.max(1, Math.floor(task.subtasksTotal * 0.35));
    } else if (targetColumn === 'todo') {
      updatedSubtasksCompleted = 0;
    }

    const updatedTask: TaskItem = {
      ...task,
      column: targetColumn,
      subtasksCompleted: updatedSubtasksCompleted
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

    // 2. Real Reflection on the Assigned Agent
    const assignedAgentQuery = task.assignedAgent.toLowerCase();
    const assignedTag = task.agentTag.toLowerCase();

    setAgents(prevAgents => prevAgents.map(ag => {
      const isTargetAgent = 
        ag.name.toLowerCase().includes(assignedAgentQuery) ||
        assignedAgentQuery.includes(ag.name.toLowerCase()) ||
        ag.codename.toLowerCase().includes(assignedTag);

      if (!isTargetAgent) return ag;

      if (targetColumn === 'inprogress') {
        const progressPct = Math.max(25, Math.round((updatedSubtasksCompleted / (task.subtasksTotal || 1)) * 100));
        return {
          ...ag,
          status: 'BUSY',
          activeTask: {
            title: task.title,
            pid: task.hash.replace('#', ''),
            fileOrSource: task.tags?.[0] ? `Context: ${task.tags[0]}` : 'Active Dispatch Pipeline',
            progress: progressPct
          },
          assignedTasks: [
            { id: `#${task.hash}`, title: task.title, active: true },
            ...ag.assignedTasks.filter(t => !t.title.includes(task.title))
          ]
        };
      } else if (targetColumn === 'done') {
        const wasActiveOnThisAgent = 
          ag.activeTask?.title === task.title || 
          ag.activeTask?.pid === task.hash.replace('#', '');

        return {
          ...ag,
          status: wasActiveOnThisAgent ? 'ONLINE' : ag.status,
          activeTask: wasActiveOnThisAgent ? undefined : ag.activeTask,
          assignedTasks: ag.assignedTasks.map(t => 
            t.title.includes(task.title) ? { ...t, active: false } : t
          )
        };
      } else if (targetColumn === 'todo') {
        const wasActiveOnThisAgent = 
          ag.activeTask?.title === task.title || 
          ag.activeTask?.pid === task.hash.replace('#', '');

        return {
          ...ag,
          status: wasActiveOnThisAgent ? 'ONLINE' : ag.status,
          activeTask: wasActiveOnThisAgent ? undefined : ag.activeTask,
          assignedTasks: ag.assignedTasks.map(t => 
            t.title.includes(task.title) ? { ...t, active: false } : t
          )
        };
      }
      return ag;
    }));

    // 3. Activity Ledger Log
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

    let logText = '';
    let logStatus = '';
    let logType: 'success' | 'info' | 'saved' | 'warning' = 'info';

    if (targetColumn === 'inprogress') {
      logText = `Task [${task.hash}] "${task.title}" moved to IN PROGRESS. Dispatched to ${task.assignedAgent}.`;
      logStatus = 'DISPATCHED';
      logType = 'info';
    } else if (targetColumn === 'done') {
      logText = `Task [${task.hash}] "${task.title}" verified & complete. SLA closed by ${task.assignedAgent}.`;
      logStatus = 'COMPLETED';
      logType = 'success';
    } else {
      logText = `Task [${task.hash}] "${task.title}" re-queued to TO DO backlog.`;
      logStatus = 'QUEUED';
      logType = 'warning';
    }

    const newEvent: ActivityEvent = {
      id: `evt-${Date.now()}`,
      timestamp: timeStr,
      agent: task.assignedAgent,
      category: 'AGENT',
      text: logText,
      status: logStatus,
      statusType: logType,
      duration: targetColumn === 'done' ? '4m 18s' : undefined
    };

    setEvents(prev => [newEvent, ...prev]);

    // 4. Toast announcement
    if (targetColumn === 'inprogress') {
      showToast(`Moved #${task.hash} to IN PROGRESS • ${task.assignedAgent} status set to BUSY`);
    } else if (targetColumn === 'done') {
      showToast(`Task #${task.hash} marked DONE • ${task.assignedAgent} headroom restored`);
    } else {
      showToast(`Returned #${task.hash} to TO DO backlog queue`);
    }
  };

  const createTask = (newTask: TaskItem) => {
    setTasks(prev => [newTask, ...prev]);
    showToast(`Created new mission #${newTask.hash} assigned to ${newTask.assignedAgent}`);
  };

  const updateAgentSoul = (agentId: string, newSoul: string) => {
    setAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, soulPrompt: newSoul } : ag));
    showToast(`Saved and hot-reloaded soul.md for ${agentId}`);
  };

  const updateAgentMemories = (agentId: string, memories: AgentMemoryItem[]) => {
    setAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, memories } : ag));
    showToast(`Updated neural memory repository for ${agentId} (${memories.length} records)`);
  };

  const changeAgentModel = (agentId: string, newModelId: string) => {
    const modelObj = AVAILABLE_MODELS.find(m => m.id === newModelId);
    if (!modelObj) return;

    setAgents(prev => prev.map(ag => {
      if (ag.id === agentId) {
        return {
          ...ag,
          activeModelId: newModelId,
          latencyLabel: `${modelObj.latencyMs}ms • ${modelObj.tag}`
        };
      }
      return ag;
    }));

    showToast(`Updated ${agentId} to ${modelObj.name}`);
  };

  const autoBalanceFleet = () => {
    setAgents(prev => {
      const total = prev.length;
      const avg = Math.floor(100 / total);
      return prev.map((ag, idx) => ({
        ...ag,
        allocationPercent: idx === 0 ? 100 - (avg * (total - 1)) : avg
      }));
    });
    showToast('Fleet workload auto-balanced across available GPU tensor cores');
  };

  const killAgentTask = (agentId: string) => {
    setAgents(prev => prev.map(ag => {
      if (ag.id === agentId) {
        return {
          ...ag,
          status: 'ONLINE',
          activeTask: undefined,
          assignedTasks: ag.assignedTasks.filter(t => !t.active)
        };
      }
      return ag;
    }));
    showToast(`Halted active task on ${agentId}. Headroom restored.`);
  };

  const deployAgent = (newAgent: Agent) => {
    setAgents(prev => [newAgent, ...prev]);
    showToast(`Successfully deployed autonomous worker: ${newAgent.name}`);
  };

  const addActivityEvent = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const newEvent: ActivityEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      timestamp: timeStr
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  return (
    <ClusterContext.Provider
      value={{
        tasks,
        agents,
        events,
        toast,
        moveTask,
        createTask,
        setTasks,
        setAgents,
        setEvents,
        updateAgentSoul,
        updateAgentMemories,
        changeAgentModel,
        autoBalanceFleet,
        killAgentTask,
        deployAgent,
        addActivityEvent,
        showToast
      }}
    >
      {children}
    </ClusterContext.Provider>
  );
};

export const useCluster = (): ClusterContextType => {
  const context = useContext(ClusterContext);
  if (!context) {
    throw new Error('useCluster must be used within a ClusterProvider');
  }
  return context;
};
