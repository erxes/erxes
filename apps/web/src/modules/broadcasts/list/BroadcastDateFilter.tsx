import { IconCalendar } from '@tabler/icons-react';
import { DatePicker, Filter, toIsoDay, useFilterContext, useFormat } from 'erxes-ui';
import { useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { broadcastsFilters, type DayRange } from './useBroadcastsList';

const DATES_KEY = 'dates';

const useDatesParam = () => useQueryState(DATES_KEY, broadcastsFilters.dates);

/** "Nov 3 – Nov 9" or one day. */
const useRangeLabel = () => {
  const fmt = useFormat();

  return ({ from, to }: DayRange) =>
    from === to ? fmt.date(from) : `${fmt.date(from)} – ${fmt.date(to)}`;
};

/** Filters by the days broadcasts went or go out: the popover entry, its calendar and the bar chip. */
export const BroadcastDateFilter = {
  Item: () => {
    const { t } = useTranslation('broadcasts');

    return (
      <Filter.Item value={DATES_KEY}>
        <IconCalendar />
        {t('list.goes-at', 'Goes out')}
      </Filter.Item>
    );
  },
  View: () => {
    const [dates, setDates] = useDatesParam();
    const { setOpen } = useFilterContext();

    return (
      <Filter.View filterKey={DATES_KEY}>
        <DatePicker
          inline
          mode="range"
          value={dates ?? undefined}
          onChange={(range) => {
            if (range && !(range instanceof Date) && !Array.isArray(range) && range.from) {
              const from = toIsoDay(range.from);

              void setDates({ from, to: range.to ? toIsoDay(range.to) : from });

              if (range.to) setOpen(false);
            }
          }}
        />
      </Filter.View>
    );
  },
  Bar: () => {
    const { t } = useTranslation('broadcasts');
    const [dates] = useDatesParam();
    const label = useRangeLabel();

    return (
      <Filter.BarItem queryKey={DATES_KEY}>
        <Filter.BarName>
          <IconCalendar />
          {t('list.goes-at', 'Goes out')}
        </Filter.BarName>
        <Filter.BarButton filterKey={DATES_KEY}>{dates && label(dates)}</Filter.BarButton>
      </Filter.BarItem>
    );
  },
};
