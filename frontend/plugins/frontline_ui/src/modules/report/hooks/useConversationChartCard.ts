import { useAtomValue, useStore, WritableAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getReportCallStatusFilterAtom,
  getReportChannelFilterAtom,
  getReportChartTypeAtom,
  getReportDateFilterAtom,
  getReportMemberFilterAtom,
  getReportSourceFilterAtom,
} from '@/report/states';
import { ReportChart, ReportChartFilters } from '@/report/types';
import { getFilters } from '@/report/utils/dateFilters';

const DEFAULT_SOURCE = 'all';
const DEFAULT_CALL_STATUS = 'all';

const dropEmptyFilters = (filters: ReportChartFilters): ReportChartFilters =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) =>
      Array.isArray(value) ? value.length > 0 : Boolean(value),
    ),
  );

const useConversationChartFilterConfig = (
  cardId: string,
): ReportChartFilters => {
  const date = useAtomValue(getReportDateFilterAtom(cardId));
  const source = useAtomValue(getReportSourceFilterAtom(cardId));
  const channelIds = useAtomValue(getReportChannelFilterAtom(cardId));
  const memberIds = useAtomValue(getReportMemberFilterAtom(cardId));

  return useMemo(
    () =>
      dropEmptyFilters({
        date,
        source: source === DEFAULT_SOURCE ? '' : source,
        channelIds,
        memberIds,
      }),
    [date, source, channelIds, memberIds],
  );
};

const useRestoreConversationChartFilters = (
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
    set(getReportSourceFilterAtom, filters.source || DEFAULT_SOURCE);
    set(getReportChannelFilterAtom, filters.channelIds || []);
    set(getReportMemberFilterAtom, filters.memberIds || []);
    set(getReportCallStatusFilterAtom, DEFAULT_CALL_STATUS);

    if (chart.visualType) {
      set(getReportChartTypeAtom, chart.visualType);
    }

    setRestored(true);
  }, [cardId, chart, store]);

  return restored;
};

interface ConversationChartCardOptions {
  title: string;
  cardId?: string;
  savedChart?: ReportChart;
}

export const useConversationChartCard = ({
  title,
  cardId,
  savedChart,
}: ConversationChartCardOptions) => {
  const id = cardId || title.toLowerCase().replace(/\s+/g, '-');
  const filtersRestored = useRestoreConversationChartFilters(id, savedChart);
  const filterConfig = useConversationChartFilterConfig(id);
  const callStatus = useAtomValue(getReportCallStatusFilterAtom(id));

  const queryFilters = useMemo(() => {
    const { date, ...rest } = filterConfig;

    return {
      ...getFilters(date || undefined),
      ...rest,
      callStatus:
        filterConfig.source === 'calls' && callStatus !== DEFAULT_CALL_STATUS
          ? callStatus
          : undefined,
    };
  }, [filterConfig, callStatus]);

  return { id, filterConfig, queryFilters, filtersRestored };
};
