import dayjs from 'dayjs';
import { IActivityBreakdown, IActivityDay } from '../types';

const DATE_FORMAT = 'YYYY-MM-DD';

/** Groups absolute slots into the viewer's local days and hours. */
export const groupActivitySlots = (
  slots: number[],
  slotMinutes: number,
  dayCount: number,
  now: number = Date.now(),
): IActivityBreakdown => {
  const slotMs = slotMinutes * 60_000;
  const today = dayjs(now).startOf('day');
  const byDate = new Map<string, IActivityDay>();

  for (let offset = dayCount - 1; offset >= 0; offset--) {
    const date = today.subtract(offset, 'day').format(DATE_FORMAT);
    byDate.set(date, { date, minutes: 0, firstAt: null, lastAt: null });
  }

  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));

  for (const slot of slots) {
    const start = dayjs(slot * slotMs);
    const day = byDate.get(start.format(DATE_FORMAT));

    if (!day) {
      continue;
    }

    day.minutes += slotMinutes;
    day.firstAt = day.firstAt ?? start.valueOf();
    day.lastAt = start.valueOf() + slotMs;

    // dayjs counts Sunday as 0; the grid starts on Monday
    heatmap[(start.day() + 6) % 7][start.hour()] += slotMinutes;
  }

  const days = [...byDate.values()];

  return {
    days,
    heatmap,
    totalMinutes: days.reduce((sum, day) => sum + day.minutes, 0),
    activeDays: days.filter((day) => day.minutes > 0).length,
  };
};
