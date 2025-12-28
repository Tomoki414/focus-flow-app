import React, { useState } from 'react';
import { Task, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';

interface ScheduleEditorProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export default function ScheduleEditor({ tasks, onAddTask, onUpdateTask, onDeleteTask }: ScheduleEditorProps) {
  const [activeDay, setActiveDay] = useState<DayOfWeek>('Monday');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Task>>({
    startTime: '09:00',
    endTime: '10:00',
    name: '',
    note: ''
  });

  const activeTasks = tasks
    .filter(t => t.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        startTime: task.startTime,
        endTime: task.endTime,
        name: task.name,
        note: task.note
      });
    } else {
      setEditingTask(null);
      setFormData({
        startTime: '09:00',
        endTime: '10:00',
        name: '',
        note: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startTime || !formData.endTime) return;

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        name: formData.name,
        startTime: formData.startTime,
        endTime: formData.endTime,
        note: formData.note || '',
        day: activeDay
      });
    } else {
      onAddTask({
        id: crypto.randomUUID(),
        day: activeDay,
        name: formData.name,
        startTime: formData.startTime,
        endTime: formData.endTime,
        note: formData.note || ''
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Day Tabs */}
      <div className="bg-white border-b border-slate-200 overflow-x-auto">
        <div className="flex p-2 space-x-2 min-w-max">
          {DAYS_OF_WEEK.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeDay === day 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {day.slice(0, 3)}
              <span className="hidden sm:inline">{day.slice(3)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">{activeDay}'s Schedule</h3>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>

        <div className="space-y-3">
          {activeTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-400">No tasks scheduled for {activeDay}.</p>
              <button onClick={() => handleOpenModal()} className="mt-2 text-indigo-500 font-medium hover:underline">
                Add one now
              </button>
            </div>
          ) : (
            activeTasks.map(task => (
              <div 
                key={task.id} 
                className="group bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-start"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 text-sm text-slate-500 font-mono mb-1">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">{task.startTime}</span>
                    <span>-</span>
                    <span>{task.endTime}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800">{task.name}</h4>
                  {task.note && <p className="text-slate-500 text-sm mt-1 line-clamp-2">{task.note}</p>}
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  <button 
                    onClick={() => handleOpenModal(task)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Start Time</label>
                  <input 
                    type="time" 
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">End Time</label>
                  <input 
                    type="time" 
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Task Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Weekly Meeting"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Notes (Optional)</label>
                <textarea 
                  placeholder="Details, links, or subtasks..."
                  rows={3}
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex justify-center items-center space-x-2"
                >
                  <Save size={18} />
                  <span>Save Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}