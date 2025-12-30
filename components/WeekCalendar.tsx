import React, { useMemo } from 'react';
import { Task, DAYS_OF_WEEK, DayOfWeek } from '../types';

interface WeekCalendarProps {
  tasks: Task[];
}

const HOURS = Array.from({ length: 25 }, (_, i) => i); // 0〜24時（24は終端表示用）

const dayLabel = (day: DayOfWeek) => day.slice(0, 3);

// "indigo" -> Tailwindクラス
const colorToClasses = (color: string | undefined, completed: boolean) => {
  const base = color ?? 'indigo';

  const table: Record<
    string,
    { bg: string; border: string; text: string; mutedBg: string; mutedText: string }
  > = {
    indigo: {
      bg: 'bg-indigo-500/80',
      border: 'border-indigo-600/80',
      text: 'text-white',
      mutedBg: 'bg-indigo-300/40',
      mutedText: 'text-indigo-900/60',
    },
    emerald: {
      bg: 'bg-emerald-500/80',
      border: 'border-emerald-600/80',
      text: 'text-white',
      mutedBg: 'bg-emerald-300/40',
      mutedText: 'text-emerald-900/60',
    },
    amber: {
      bg: 'bg-amber-500/80',
      border: 'border-amber-600/80',
      text: 'text-slate-900',
      mutedBg: 'bg-amber-200/40',
      mutedText: 'text-amber-900/70',
    },
    rose: {
      bg: 'bg-rose-500/80',
      border: 'border-rose-600/80',
      text: 'text-white',
      mutedBg: 'bg-rose-300/40',
      mutedText: 'text-rose-900/70',
    },
    sky: {
      bg: 'bg-sky-500/80',
      border: 'border-sky-600/80',
      text: 'text-slate-900',
      mutedBg: 'bg-sky-200/40',
      mutedText: 'text-sky-900/70',
    },
  };

  const palette = table[base] ?? table.indigo;
  return completed
    ? `${palette.mutedBg} ${palette.mutedText} border border-transparent`
    : `${palette.bg} ${palette.text} border ${palette.border}`;
};

// "HH:mm" -> 分
const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export default function WeekCalendar({ tasks }: WeekCalendarProps) {
  const tasksByDay = useMemo(() => {
    const map: Record<DayOfWeek, Task[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };
    for (const task of tasks) {
      map[task.day].push(task);
    }
    (Object.keys(map) as DayOfWeek[]).forEach((day) => {
      map[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return map;
  }, [tasks]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-4 md:px-6 md:pt-6">
        <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-1">
          Weekly Calendar
        </h2>
        <p className="text-xs md:text-sm text-slate-500">
          Monday start – Sunday end / 00:00 – 24:00
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="min-w-[720px] border border-slate-200 rounded-xl bg-white shadow-sm">
          {/* ヘッダー行（曜日） */}
          <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10">
            <div className="px-2 py-2 text-xs text-slate-400 uppercase tracking-wider">
              Time
            </div>
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="px-2 py-2 text-xs md:text-sm font-semibold text-slate-600 text-center"
              >
                <span className="md:hidden">{dayLabel(day)}</span>
                <span className="hidden md:inline">{day}</span>
              </div>
            ))}
          </div>

          <div className="relative">
            {/* 時間グリッド（背景） */}
            <div className="grid grid-cols-[64px_repeat(7,1fr)] text-xs">
              {HOURS.map((hour, rowIdx) => (
                <React.Fragment key={hour}>
                  {/* 時刻ラベル */}
                  <div
                    className={`h-12 border-t border-slate-200 px-1 pt-1 text-[10px] md:text-xs text-slate-400 text-right pr-2 ${
                      rowIdx === 0 ? 'border-t-0' : ''
                    }`}
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  {/* 各曜日のセル */}
                  {DAYS_OF_WEEK.map((day, colIdx) => (
                    <div
                      key={`${day}-${hour}`}
                      className={`h-12 border-t border-l border-slate-100 ${
                        rowIdx === 0 ? 'border-t-0' : ''
                      } ${colIdx === 0 ? '' : ''}`}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>

            {/* タスク（絶対配置） */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="grid grid-cols-[64px_repeat(7,1fr)] h-full">
                <div />{/* 時刻列のプレースホルダ */}
                {DAYS_OF_WEEK.map((day) => {
                  const dayTasks = tasksByDay[day];
                  return (
                    <div key={day} className="relative">
                      {dayTasks.map((task) => {
                        const start = toMinutes(task.startTime);
                        const end = toMinutes(task.endTime);
                        const duration = Math.max(end - start, 15); // 最低15分

                        const top = (start / (24 * 60)) * 100;
                        const height = (duration / (24 * 60)) * 100;

                        return (
                          <div
                            key={task.id}
                            className={`absolute left-1 right-1 rounded-md shadow-sm text-[10px] md:text-xs px-2 py-1 overflow-hidden pointer-events-auto cursor-default ${colorToClasses(
                              task.color,
                              task.completed
                            )}`}
                            style={{
                              top: `${top}%`,
                              height: `${height}%`,
                              minHeight: '1.75rem',
                            }}
                          >
                            <div className="font-semibold truncate">
                              {task.name}
                            </div>
                            <div className="text-[9px] md:text-[10px] opacity-80">
                              {task.startTime} - {task.endTime}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 凡例 */}
        <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-slate-500">
          <div className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-indigo-500/80" />
            <span>Default</span>
          </div>
          <div className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-emerald-500/80" />
            <span>Deep Work / Focus</span>
          </div>
          <div className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-amber-400/80" />
            <span>Break / Personal</span>
          </div>
          <div className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-rose-500/80" />
            <span>Meeting / Social</span>
          </div>
          <div className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-sky-500/80" />
            <span>School / Study</span>
          </div>
          <div className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-slate-300/60" />
            <span>Completed tasks appear lighter</span>
          </div>
        </div>
      </div>
    </div>
  );
}


