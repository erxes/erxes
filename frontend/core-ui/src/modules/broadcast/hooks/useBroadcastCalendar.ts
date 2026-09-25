import { useQuery } from '@apollo/client';
import { useMultiQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { BROADCAST_CALENDAR } from '../graphql/queries';
import {
  buildMonthGrid,
  isCurrentMonth,
  monthLabel,
  monthParam,
  monthWindow,
  parseMonth,
  shiftMonth,
  TCalendarEntry,
} from '../utils/calendarMonth';
import { useBroadcastMessageVariables } from './useBroadcastMessages';

/**
 * The month the calendar is showing, and everything that falls in it.
 *
 * The month lives in the URL like the rest of the list's state, so a link to
 * next March opens on next March, and coming back from a campaign returns to
 * the month it was opened from.
 */
export const useBroadcastCalendar = () => {
  const [queryParams, setQueryParams] = useMultiQueryState<{ month: string }>([
    'month',
  ]);
  const filters = useBroadcastMessageVariables();

  const month = parseMonth(queryParams.month);
  const { from, to } = monthWindow(month);

  const { data, previousData, loading, error, refetch } = useQuery(
    BROADCAST_CALENDAR,
    { variables: { from, to, ...filters } },
  );

  // Held over while the next month loads. Without it every step through the
  // months empties the grid and puts it back, which reads as a flash.
  const entries: TCalendarEntry[] =
    data?.engageScheduleCalendar ?? previousData?.engageScheduleCalendar ?? [];

  const days = useMemo(() => buildMonthGrid(month, entries), [month, entries]);

  const goToMonth = (next: Date) =>
    // The month being lived in is the default, so it stays out of the URL.
    setQueryParams({ month: isCurrentMonth(next) ? null : monthParam(next) });

  return {
    month,
    label: monthLabel(month),
    days,
    total: entries.length,
    isCurrentMonth: isCurrentMonth(month),
    loading,
    error,
    refetch,
    goPrevious: () => goToMonth(shiftMonth(month, -1)),
    goNext: () => goToMonth(shiftMonth(month, 1)),
    goToday: () => goToMonth(new Date()),
  };
};
