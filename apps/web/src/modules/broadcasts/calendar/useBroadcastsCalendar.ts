import { orpc } from '@erxes/core-contract/client';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { isSameMonth } from 'date-fns';
import { useFormat } from 'erxes-ui';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { forwardPaging } from '~/lib/cursorList';
import { useSession } from '~/modules/auth/session';
import { flattenPages } from '../BroadcastBits';
import { useBroadcastsFilters } from '../list/useBroadcastsList';
import {
  buildMonthGrid,
  calendarEntries,
  monthParam,
  monthWindow,
  parseMonth,
  shiftMonth,
  weekDays,
} from './calendarMonth';

/** The API's largest page: a month rarely needs a second. */
const PAGE = 100;

/** A month with more than 1,000 broadcasts shows the newest 1,000. */
const MAX_PAGES = 10;

/**
 * Recurring broadcasts' runs not made yet in the window, by the list's filters: none when the
 * status asked for is another.
 */
const useUpcomingRuns = (
  range: { from: string; to: string },
  shared: ReturnType<typeof useBroadcastsFilters>['shared'],
) => {
  const shown = !shared.status || shared.status === 'recurring';

  const upcoming = useQuery(
    orpc.broadcastSchedules.upcoming.queryOptions({
      input: range,
      enabled: shown,
      placeholderData: keepPreviousData,
    }),
  );

  const search = shared.search?.toLowerCase();

  return shown
    ? (upcoming.data?.data ?? []).filter(
        (run) =>
          (!shared.channel || run.channel === shared.channel) &&
          (!search || run.name.toLowerCase().includes(search)),
      )
    : [];
};

/**
 * The month the calendar shows (`?month=yyyy-MM`, the current one by default) and every broadcast
 * that went or goes out in its six weeks, by the list's other filters.
 */
export const useBroadcastsCalendar = () => {
  const fmt = useFormat();
  const [monthValue, setMonthValue] = useQueryState('month', parseAsString);
  const { shared } = useBroadcastsFilters();
  const { timezone } = useSession().organization;
  const month = parseMonth(monthValue);
  const range = monthWindow(month, timezone);

  const query = useInfiniteQuery(
    orpc.broadcasts.list.infiniteOptions({
      // It loads every page of the month anyway: coming back shows them all at once.
      ...forwardPaging(PAGE, { keepPages: true }),
      input: (page) => ({ ...page, ...shared, ...range }),
      select: flattenPages,
      placeholderData: keepPreviousData,
    }),
  );

  const { hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = query;
  const loaded = query.data?.rows.length ?? 0;

  // Every page of the month, so no day looks emptier than it is: up to MAX_PAGES, and a failed
  // page stops the run instead of retrying on every render.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError && loaded < PAGE * MAX_PAGES) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, loaded, fetchNextPage]);

  const upcoming = useUpcomingRuns(range, shared);
  const entries = calendarEntries(query.data?.rows ?? [], upcoming);
  const [today] = useState(() => new Date());
  const days = buildMonthGrid(month, entries, today, timezone);

  const goTo = (next: Date) =>
    void setMonthValue(isSameMonth(next, today) ? null : monthParam(next));

  return {
    query,
    label: fmt.date(month, 'LLLL yyyy'),
    weekdays: weekDays(month).map((day) => fmt.date(day, 'EEE')),
    days,
    total: (query.data?.total ?? 0) + upcoming.length,
    isCurrentMonth: isSameMonth(month, today),
    goPrevious: () => goTo(shiftMonth(month, -1)),
    goNext: () => goTo(shiftMonth(month, 1)),
    goToday: () => goTo(today),
  };
};
