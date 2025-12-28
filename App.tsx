import React, { useState, useEffect } from 'react';
import { Task, AppView } from './types';
import Dashboard from './components/Dashboard';
import ScheduleEditor from './components/ScheduleEditor';
import { Calendar, LayoutDashboard } from 'lucide-react';

const STORAGE_KEY = 'focusflow_tasks_v1';

// Initial demo data
const INITIAL_TASKS: Task[] = [
  { id: '1', day: 'Monday', startTime: '09:00', endTime: '10:00', name: 'Check Emails', note: 'Reply to urgent matters' },
  { id: '2', day: 'Monday', startTime: '10:00', endTime: '12:00', name: 'Deep Work', note: 'Coding session' },
  { id: '3', day: 'Monday', startTime: '12:00', endTime: '13:00', name: 'Lunch Break', note: 'Relax' },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
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
          <Dashboard tasks={tasks} />
        ) : (
          <ScheduleEditor 
            tasks={tasks} 
            onAddTask={addTask} 
            onUpdateTask={updateTask} 
            onDeleteTask={deleteTask} 
          />
        )}
      </main>

    </div>
  );
}