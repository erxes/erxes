import { useMultiQueryState } from 'erxes-ui';
import {
  dayParam,
  orderRange,
  parseDay,
  TDayRange,
} from '../utils/calendarMonth';

type TScheduleRangeParams = { scheduleFrom: string; scheduleTo: string };

/**
 * The days a campaign is being planned into.
 *
 * Kept in the URL rather than in a store: it is the one piece of state that
 * has to survive the calendar handing over to the creation sheet, and a link
 * to "a campaign across next week" is worth having on its own.
 */
export const useBroadcastScheduleRange = () => {
  const [params, setQueryParams] = useMultiQueryState<TScheduleRangeParams>([
    'scheduleFrom',
    'scheduleTo',
  ]);

  const start = parseDay(params.scheduleFrom);
  const end = parseDay(params.scheduleTo);

  const range: TDayRange | undefined =
    start && end ? orderRange(start, end) : undefined;

  const setRange = (next: TDayRange) =>
    setQueryParams({
      scheduleFrom: dayParam(next.start),
      scheduleTo: dayParam(next.end),
    });

  const clearRange = () =>
    setQueryParams({ scheduleFrom: null, scheduleTo: null });

  return { range, setRange, clearRange };
};
