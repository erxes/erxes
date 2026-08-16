import dayjs from 'dayjs';
import { parseDateRangeFromString, useMultiQueryState } from 'erxes-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const STATS_DEFAULT_WINDOW_DAYS = 30;

export const useAutomationStatsWindow = () => {
  const [queries] = useMultiQueryState<{ createdAt: string }>(['createdAt']);
  const filterKey = queries.createdAt || '';
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setOffset(0);
  }, [filterKey]);

  const { beginDate, endDate, lengthDays, isLatest } = useMemo(() => {
    const range = parseDateRangeFromString(filterKey);
    const latestEnd = range?.to ? dayjs(range.to) : dayjs();
    const days = range?.from
      ? Math.max(dayjs(latestEnd).diff(dayjs(range.from), 'day') + 1, 1)
      : STATS_DEFAULT_WINDOW_DAYS;

    const end = latestEnd.subtract(offset * days, 'day').endOf('day');

    return {
      beginDate: end
        .subtract(days - 1, 'day')
        .startOf('day')
        .toDate(),
      endDate: end.toDate(),
      lengthDays: days,
      isLatest: offset === 0,
    };
  }, [filterKey, offset]);

  const goToPrevious = useCallback(() => setOffset((v) => v + 1), []);
  const goToNext = useCallback(() => setOffset((v) => Math.max(v - 1, 0)), []);

  return {
    beginDate,
    endDate,
    lengthDays,
    isLatest,
    goToPrevious,
    goToNext,
  };
};
