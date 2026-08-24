import { useAtomValue, useStore, WritableAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getReportChartTypeAtom,
  getReportDateFilterAtom,
  getReportFacebookPageFilterAtom,
  getReportFacebookSearchFilterAtom,
} from '@/report/states';
import { ReportChart, ReportChartFilters } from '@/report/types';
import { getFilters } from '@/report/utils/dateFilters';

const useFacebookChartFilterConfig = (cardId: string): ReportChartFilters => {
  const date = useAtomValue(getReportDateFilterAtom(cardId));
  const pageIds = useAtomValue(getReportFacebookPageFilterAtom(cardId));
  const searchValue = useAtomValue(getReportFacebookSearchFilterAtom(cardId));

  return useMemo(() => {
    const filters: ReportChartFilters = {};

    if (date) {
      filters.date = date;
    }

    if (pageIds.length) {
      filters.pageIds = pageIds;
    }

    if (searchValue.trim()) {
      filters.searchValue = searchValue.trim();
    }

    return filters;
  }, [date, pageIds, searchValue]);
};

const useRestoreFacebookChartFilters = (
  cardId: string,
  chart?: ReportChart,
): boolean => {
  const store = useStore();
  const restoredChartId = useRef<string | undefined>(undefined);
  const [restored, setRestored] = useState(!chart);

  useEffect(() => {
    if (!chart || restoredChartId.current === chart._id) {
      return;
    }

    restoredChartId.current = chart._id;
    const filters = chart.filters || {};
    const set = <T>(
      getAtom: (id: string) => WritableAtom<T, [T], void>,
      value: T,
    ) => store.set(getAtom(cardId), value);

    set(getReportDateFilterAtom, filters.date || '');
    set(getReportFacebookPageFilterAtom, filters.pageIds || []);
    set(getReportFacebookSearchFilterAtom, filters.searchValue || '');

    if (chart.visualType) {
      set(getReportChartTypeAtom, chart.visualType);
    }

    setRestored(true);
  }, [cardId, chart, store]);

  return restored;
};

interface FacebookChartCardOptions {
  title: string;
  cardId?: string;
  savedChart?: ReportChart;
}

export const useFacebookChartCard = ({
  title,
  cardId,
  savedChart,
}: FacebookChartCardOptions) => {
  const id = cardId || title.toLowerCase().replace(/\s+/g, '-');
  const filtersRestored = useRestoreFacebookChartFilters(id, savedChart);
  const filterConfig = useFacebookChartFilterConfig(id);

  const queryFilters = useMemo(() => {
    const { date, ...rest } = filterConfig;

    return { ...getFilters(date || undefined), ...rest };
  }, [filterConfig]);

  return { id, filterConfig, queryFilters, filtersRestored };
};
