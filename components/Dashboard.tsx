import React, { useState, useEffect, useMemo } from 'react';
import { Task, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { Clock, CheckCircle2, Coffee, ArrowRight } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
}

export default function Dashboard({ tasks }: DashboardProps) {
  const [now, setNow] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDayName = DAYS_OF_WEEK[now.getDay() === 0 ? 6 : now.getDay() - 1]; // JS getDay: 0=Sun, Adjust to Mon=0 index if needed, but our array is Mon-Sun.
  // Actually, standard Date.getDay() returns 0 for Sunday, 1 for Monday.
  // Our DAYS_OF_WEEK is ['Monday', 'Tuesday', ..., 'Sunday'].
  // So: 1->Monday(0), 2->Tuesday(1)... 6->Saturday(5), 0->Sunday(6).
  const dayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const todayName = DAYS_OF_WEEK[dayIndex];

  const currentTimeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

  // Filter tasks for today
  const todaysTasks = useMemo(() => {
    return tasks
      .filter(t => t.day === todayName)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [tasks, todayName]);

  // Determine current and next tasks
  const { currentTask, nextTask } = useMemo(() => {
    let current: Task | null = null;
    let next: Task | null = null;

    for (const task of todaysTasks) {
      if (task.startTime <= currentTimeStr && task.endTime > currentTimeStr) {
        current = task;
      } else if (task.startTime > currentTimeStr) {
        if (!next) next = task; // Find the first one after now
      }
    }
    
    // If no next task found today, maybe show "No more tasks today"
    return { currentTask: current, nextTask: next };
  }, [todaysTasks, currentTimeStr]);

  // Calculate progress of current task
  const progressPercent = useMemo(() => {
    if (!currentTask) return 0;
    
    const parseMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const start = parseMinutes(currentTask.startTime);
    const end = parseMinutes(currentTask.endTime);
    const current = parseMinutes(currentTimeStr);
    
    const totalDuration = end - start;
    const elapsed = current - start;
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }, [currentTask, currentTimeStr]);

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      
      {/* Time Display */}
      <div className="text-center space-y-2 mb-8">
        <p className="text-indigo-500 font-semibold tracking-wide uppercase text-sm">
          {todayName}, {now.toLocaleDateString()}
        </p>
        <h2 className="text-6xl md:text-7xl font-light text-slate-800 tabular-nums tracking-tighter">
          {now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
          <span className="text-2xl text-slate-400 ml-2 font-normal">
             {now.toLocaleTimeString('en-US', { second: '2-digit' })}
          </span>
        </h2>
      </div>

      {/* Current Task Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl transform rotate-1 opacity-10"></div>
        <div className={`relative bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ${!currentTask ? 'border-dashed border-2 border-slate-300 shadow-none bg-slate-50' : ''}`}>
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${currentTask ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                Now
              </span>
              {currentTask && (
                <div className="flex items-center text-slate-500 text-sm font-medium">
                   <Clock size={16} className="mr-1" />
                   <span>Ends at {currentTask.endTime}</span>
                </div>
              )}
            </div>

            {currentTask ? (
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                  {currentTask.name}
                </h3>
                {currentTask.note && (
                  <p className="text-slate-600 bg-slate-50 p-4 rounded-xl text-lg border-l-4 border-indigo-400">
                    {currentTask.note}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Coffee size={48} className="mb-4 text-slate-300" />
                <h3 className="text-2xl font-medium text-slate-500">Free Time</h3>
                <p>Relax and recharge.</p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {currentTask && (
             <div className="h-2 bg-slate-100 w-full">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                />
             </div>
          )}
        </div>
      </div>

      {/* Next Task Section */}
      <div className="pt-4">
        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
          <ArrowRight size={16} className="mr-2" />
          Up Next
        </h4>
        
        {nextTask ? (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-colors">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">
                Starts at {nextTask.startTime}
              </p>
              <h4 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {nextTask.name}
              </h4>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
              <Clock size={20} />
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-sm">
            No more tasks scheduled for today.
          </div>
        )}
      </div>

    </div>
  );
}