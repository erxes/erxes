import { useAtomValue, useStore, WritableAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getReportChannelFilterAtom,
  getReportChartTypeAtom,
  getReportCompanyFilterAtom,
  getReportCustomerFilterAtom,
  getReportDateFilterAtom,
  getReportFrequencyFilterAtom,
  getReportGroupPropertyFilterAtom,
  getReportMemberFilterAtom,
  getReportPipelineFilterAtom,
  getReportPriorityFilterAtom,
  getReportPropertyFilterAtom,
  getReportStateFilterAtom,
  getReportTicketTagFilterAtom,
} from '@/report/states';
import {
  ReportChart,
  ReportChartFilters,
  TicketPropertyFilter,
} from '@/report/types';

const DEFAULT_FREQUENCY = 'day';
const DEFAULT_STATE = 'active';

const dropEmptyFilters = (filters: ReportChartFilters): ReportChartFilters =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) =>
      Array.isArray(value) ? value.length > 0 : Boolean(value),
    ),
  );

export const useTicketChartFilterConfig = (
  cardId: string,
): ReportChartFilters => {
  const date = useAtomValue(getReportDateFilterAtom(cardId));
  const state = useAtomValue(getReportStateFilterAtom(cardId));
  const frequency = useAtomValue(getReportFrequencyFilterAtom(cardId));
  const groupPropertyId = useAtomValue(
    getReportGroupPropertyFilterAtom(cardId),
  );
  const channelIds = useAtomValue(getReportChannelFilterAtom(cardId));
  const memberIds = useAtomValue(getReportMemberFilterAtom(cardId));
  const pipelineIds = useAtomValue(getReportPipelineFilterAtom(cardId));
  const tagIds = useAtomValue(getReportTicketTagFilterAtom(cardId));
  const customerIds = useAtomValue(getReportCustomerFilterAtom(cardId));
  const companyIds = useAtomValue(getReportCompanyFilterAtom(cardId));
  const priority = useAtomValue(getReportPriorityFilterAtom(cardId));
  const propertyFilters = useAtomValue(getReportPropertyFilterAtom(cardId));

  return useMemo(
    () =>
      dropEmptyFilters({
        date,
        state,
        frequency: frequency === DEFAULT_FREQUENCY ? '' : frequency,
        groupPropertyId,
        channelIds,
        memberIds,
        pipelineIds,
        tagIds,
        customerIds,
        companyIds,
        priority,
        propertyIds: propertyFilters.map(({ propertyId }) => propertyId),
        propertyValueFilters: propertyFilters.filter(
          ({ values }) => values.length,
        ),
      }),
    [
      date,
      state,
      frequency,
      groupPropertyId,
      channelIds,
      memberIds,
      pipelineIds,
      tagIds,
      customerIds,
      companyIds,
      priority,
      propertyFilters,
    ],
  );
};

const toPropertyFilters = (
  filters: ReportChartFilters,
): TicketPropertyFilter[] => {
  const valueFilters = filters.propertyValueFilters || [];
  const withValues = new Set(
    valueFilters.map((propertyFilter) => propertyFilter.propertyId),
  );

  const withoutValues = (filters.propertyIds || [])
    .filter((propertyId) => !withValues.has(propertyId))
    .map((propertyId) => ({ propertyId, values: [] }));

  return [
    ...valueFilters.map((propertyFilter) => ({
      propertyId: propertyFilter.propertyId,
      type: propertyFilter.type,
      values: propertyFilter.values || [],
    })),
    ...withoutValues,
  ];
};

export const useRestoreTicketChartFilters = (
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
    const set = <T,>(
      getAtom: (id: string) => WritableAtom<T, [T], void>,
      value: T,
    ) => store.set(getAtom(cardId), value);

    set(getReportDateFilterAtom, filters.date || '');
    set(getReportStateFilterAtom, filters.state || DEFAULT_STATE);
    set(getReportFrequencyFilterAtom, filters.frequency || DEFAULT_FREQUENCY);
    set(getReportGroupPropertyFilterAtom, filters.groupPropertyId || '');
    set(getReportChannelFilterAtom, filters.channelIds || []);
    set(getReportMemberFilterAtom, filters.memberIds || []);
    set(getReportPipelineFilterAtom, filters.pipelineIds || []);
    set(getReportTicketTagFilterAtom, filters.tagIds || []);
    set(getReportCustomerFilterAtom, filters.customerIds || []);
    set(getReportCompanyFilterAtom, filters.companyIds || []);
    set(getReportPriorityFilterAtom, filters.priority || []);
    set(getReportPropertyFilterAtom, toPropertyFilters(filters));

    if (chart.visualType) {
      set(getReportChartTypeAtom, chart.visualType);
    }

    setRestored(true);
  }, [cardId, chart, store]);

  return restored;
};
