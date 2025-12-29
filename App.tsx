import React, { useState, useEffect } from 'react';
import { Task, AppView } from './types';
import Dashboard from './components/Dashboard';
import ScheduleEditor from './components/ScheduleEditor';
import { Calendar, LayoutDashboard } from 'lucide-react';

const STORAGE_KEY = 'focusflow_tasks_v1';
const RESET_KEY = 'focusflow_last_reset_date';

// Initial demo data
const INITIAL_TASKS: Task[] = [
  { id: '1', day: 'Monday', startTime: '09:00', endTime: '10:00', name: 'Check Emails', note: 'Reply to urgent matters', completed: false },
  { id: '2', day: 'Monday', startTime: '10:00', endTime: '12:00', name: 'Deep Work', note: 'Coding session', completed: false },
  { id: '3', day: 'Monday', startTime: '12:00', endTime: '13:00', name: 'Lunch Break', note: 'Relax', completed: false },
];

// Helper to get the date string (YYYY-MM-DD) of the Monday of the current week
const getCurrentMondayDateString = (): string => {
  const d = new Date();
  const day = d.getDay();
  // Adjust so Monday is 0 for calculation purposes relative to "start of week" logic
  // Standard getDay: Sun=0, Mon=1...
  // We want to subtract (day - 1) days. If day is 0 (Sun), subtract -6 days (go back 6 days).
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    const lastResetDate = localStorage.getItem(RESET_KEY);
    const currentMonday = getCurrentMondayDateString();

    let parsedTasks: Task[] = savedTasks ? JSON.parse(savedTasks) : INITIAL_TASKS;
    
    // Ensure all loaded tasks have the 'completed' property (migration for old data)
    parsedTasks = parsedTasks.map(t => ({ ...t, completed: t.completed ?? false }));

    // Weekly Reset Logic
    if (lastResetDate !== currentMonday) {
      // It's a new week (or first run), reset all completed statuses
      parsedTasks = parsedTasks.map(t => ({ ...t, completed: false }));
      localStorage.setItem(RESET_KEY, currentMonday);
    }

    return parsedTasks;
  });

  const [view, setView] = useState<AppView>('dashboard');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto md:max-w-4xl bg-white shadow-xl md:my-8 md:rounded-3xl overflow-hidden border border-slate-200">
      
      {/* Header / Navigation */}
      <header className="bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
          FocusFlow
        </h1>
        <div className="flex space-x-2 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setView('dashboard')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              view === 'dashboard' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setView('editor')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              view === 'editor' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Calendar size={18} />
            <span>Schedule</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        {view === 'dashboard' ? (
          <Dashboard 
            tasks={tasks} 
            onToggleTask={toggleTaskCompletion}
          />
        ) : (
          <ScheduleEditor 
            tasks={tasks} 
            onAddTask={addTask} 
            onUpdateTask={updateTask} 
            onDeleteTask={deleteTask}
            onToggleTask={toggleTaskCompletion}
          />
        )}
      </main>

    </div>
  );
}