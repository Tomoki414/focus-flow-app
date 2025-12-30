export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export interface Task {
  id: string;
  day: DayOfWeek;
  startTime: string; // Format "HH:mm"
  endTime: string;   // Format "HH:mm"
  name: string;
  note?: string;
  completed: boolean;
  /**
   * Tailwindのクラス名またはカラーキー
   * 例: "indigo", "emerald", "rose" など
   */
  color?: string;
}

export type AppView = 'dashboard' | 'editor' | 'calendar';