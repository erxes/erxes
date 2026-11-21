import { type Broadcast, BroadcastChannel, BroadcastStatus } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconCalendarMonth } from '@tabler/icons-react';
import { toIsoDay, useListDisplay } from 'erxes-ui';
import { addDays, isValid, parseISO } from 'date-fns';
import { createParser, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { useCursorList } from '~/lib/cursorList';
import { zonedDayStart } from '~/lib/timeZones';
import { useSession } from '~/modules/auth/session';

/** RecordTable remembers the scroll position of the list under this key. */
const BROADCASTS_SESSION_KEY = 'core_broadcasts_cursor';

export const BROADCASTS_DISPLAY = 'broadcasts';

/** A range of local days, `yyyy-MM-dd..yyyy-MM-dd` in the URL; one day is both ends. */
export interface DayRange {
  from: string;
  to: string;
}

const isDay = (value: string) => isValid(parseISO(value));

const parseAsDayRange = createParser<DayRange>({
  parse: (value) => {
    const [from = '', to = from] = value.split('..');

    return isDay(from) && isDay(to) ? { from, to } : null;
  },
  serialize: ({ from, to }) => (from === to ? from : `${from}..${to}`),
  eq: (a, b) => a.from === b.from && a.to === b.to,
});

export const broadcastsFilters = {
  searchValue: parseAsString,
  status: parseAsStringLiteral(BroadcastStatus.options),
  channel: parseAsStringLiteral(BroadcastChannel.options),
  dates: parseAsDayRange,
};

/** The organisation's days as the API's window: from the first day's start to the day after the last. */
const dayRangeWindow = ({ from, to }: DayRange, zone: string) => ({
  from: zonedDayStart(from, zone).toISOString(),
  to: zonedDayStart(toIsoDay(addDays(parseISO(to), 1)), zone).toISOString(),
});

/** The list's filters from the URL, as the list procedure takes them; `dates` only for the table. */
export const useBroadcastsFilters = () => {
  const [{ searchValue, status, channel, dates }] = useQueryStates(broadcastsFilters);
  const search = useDeferredValue(searchValue?.trim() ?? '');

  return {
    shared: {
      search: search || undefined,
      status: status ?? undefined,
      channel: channel ?? undefined,
    },
    dates,
  };
};

/** The table's keyset list, by every filter. */
export const useBroadcasts = () => {
  const { shared, dates } = useBroadcastsFilters();
  const { timezone } = useSession().organization;
  const filters = { ...shared, ...(dates ? dayRangeWindow(dates, timezone) : {}) };

  return useCursorList<Broadcast>({
    sessionKey: BROADCASTS_SESSION_KEY,
    filters,
    options: (paging) =>
      orpc.broadcasts.list.infiniteOptions({
        input: (page) => ({ ...page, ...filters }),
        ...paging,
      }),
  });
};

/** Table or calendar, as picked under Display and remembered in this browser. */
export const useBroadcastsDisplay = () => {
  const { t } = useTranslation('broadcasts');

  const displays = [
    'table',
    { key: 'calendar', label: t('list.calendar', 'Calendar'), icon: IconCalendarMonth },
  ] as const;

  const [display] = useListDisplay(BROADCASTS_DISPLAY, displays);

  return { display, displays };
};
