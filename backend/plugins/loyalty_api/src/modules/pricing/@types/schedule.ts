export const SCHEDULE_WINDOW_TYPES = [
  'daily',
  'weekly',
  'monthly',
  'yearly',
] as const;

export type ScheduleWindowType = (typeof SCHEDULE_WINDOW_TYPES)[number];

// Which moment of a purchase the schedule is checked at.
export const SCHEDULE_MOMENTS = ['checkout', 'orderCreated', 'either'] as const;

export type ScheduleMoment = (typeof SCHEDULE_MOMENTS)[number];

// A plan with a schedule applies inside any of its windows, read on the
// organization's wall clock.
export interface IActiveWindow {
  type: ScheduleWindowType;
  // 'HH:mm'. An end earlier than the start runs past midnight; '24:00' ends the day.
  startTime: string;
  endTime: string;
  // weekly: 0 = Sunday … 6 = Saturday.
  weekDays?: number[];
  // monthly: 1–31.
  monthDays?: number[];
  // yearly: 'MM-DD', inclusive; a later start than end wraps the new year.
  fromMonthDay?: string;
  toMonthDay?: string;
}
