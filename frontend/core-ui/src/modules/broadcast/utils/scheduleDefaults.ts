import dayjs from 'dayjs';
import type { TimeValue } from 'react-aria-components';
import { TBroadcastScheduleForm } from './scheduleForm';

/** Far enough ahead that the offered moment is never already in the past. */
export const defaultScheduleMoment = () =>
  dayjs().add(1, 'day').hour(9).minute(0).second(0).millisecond(0).toDate();

export const emptySchedule = (): TBroadcastScheduleForm => ({
  every: 'once',
  at: defaultScheduleMoment(),
});

/** The picked day, keeping the time already chosen. */
export const withScheduleDate = (at: Date, next: Date) =>
  dayjs(next).hour(at.getHours()).minute(at.getMinutes()).second(0).toDate();

/** The picked time, keeping the day already chosen. */
export const withScheduleTime = (at: Date, time: TimeValue) =>
  dayjs(at).hour(time.hour).minute(time.minute).second(0).toDate();
