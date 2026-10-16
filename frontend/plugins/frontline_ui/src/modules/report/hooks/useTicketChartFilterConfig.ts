import { isDefined } from 'erxes-ui';
import { useAtomValue, useStore, WritableAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getReportStatusChangedDateFilterAtom,
  getReportUpdatedAtDateFilterAtom,
  getReportDescriptionFilterAtom,
  getReportStatusChangedByFilterAtom,
  getReportUpdatedByFilterAtom,
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
  getReportTicketStatusFilterAtom,
  getReportTicketTagFilterAtom,
} from '@/report/states';
import {
  ReportChart,
  ReportChartFilters,
  SavedReportChartFilters,
  TicketPropertyFilter,
  isResponsesChartType,
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
  const statusChangedDate = useAtomValue(
    getReportStatusChangedDateFilterAtom(cardId),
  );
  const updatedAtDate = useAtomValue(getReportUpdatedAtDateFilterAtom(cardId));
  const description = useAtomValue(getReportDescriptionFilterAtom(cardId));
  const statusChangedByIds = useAtomValue(
    getReportStatusChangedByFilterAtom(cardId),
  );
  const updatedByIds = useAtomValue(getReportUpdatedByFilterAtom(cardId));
  const date = useAtomValue(getReportDateFilterAtom(cardId));
  const state = useAtomValue(getReportStateFilterAtom(cardId));
  const statusIds = useAtomValue(getReportTicketStatusFilterAtom(cardId));
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
        statusChangedDate,
        updatedAtDate,
        description,
        statusChangedByIds,
        updatedByIds,
        date,
        state,
        statusIds,
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
      statusChangedDate,
      updatedAtDate,
      description,
      statusChangedByIds,
      updatedByIds,
      date,
      state,
      statusIds,
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
  filters: SavedReportChartFilters,
): TicketPropertyFilter[] => {
  const valueFilters = (filters.propertyValueFilters ?? [])
    .filter(isDefined)
    .flatMap((filter): TicketPropertyFilter[] =>
      filter.propertyId
        ? [
            {
              propertyId: filter.propertyId,
              type: filter.type ?? undefined,
              values: (filter.values ?? []).filter(isDefined),
            },
          ]
        : [],
    );
  const withValues = new Set(valueFilters.map((filter) => filter.propertyId));
  const withoutValues = (filters.propertyIds ?? [])
    .filter(isDefined)
    .filter((propertyId) => !withValues.has(propertyId))
    .map((propertyId) => ({ propertyId, values: [] }));
  return [...valueFilters, ...withoutValues];
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

    const filters: SavedReportChartFilters = chart.filters ?? {};
    const set = <T>(
      getAtom: (id: string) => WritableAtom<T, [T], void>,
      value: T,
    ) => store.set(getAtom(cardId), value);

    set(getReportStatusChangedDateFilterAtom, filters.statusChangedDate || '');
    set(getReportUpdatedAtDateFilterAtom, filters.updatedAtDate || '');
    set(getReportDescriptionFilterAtom, filters.description || '');
    set(
      getReportStatusChangedByFilterAtom,
      (filters.statusChangedByIds ?? []).filter(isDefined),
    );
    set(
      getReportUpdatedByFilterAtom,
      (filters.updatedByIds ?? []).filter(isDefined),
    );
    set(getReportDateFilterAtom, filters.date || '');
    set(getReportStateFilterAtom, filters.state || DEFAULT_STATE);
    set(
      getReportTicketStatusFilterAtom,
      (filters.statusIds ?? []).filter(isDefined),
    );
    set(getReportFrequencyFilterAtom, filters.frequency || DEFAULT_FREQUENCY);
    set(getReportGroupPropertyFilterAtom, filters.groupPropertyId || '');
    set(
      getReportChannelFilterAtom,
      (filters.channelIds ?? []).filter(isDefined),
    );
    set(getReportMemberFilterAtom, (filters.memberIds ?? []).filter(isDefined));
    set(
      getReportPipelineFilterAtom,
      (filters.pipelineIds ?? []).filter(isDefined),
    );
    set(getReportTicketTagFilterAtom, (filters.tagIds ?? []).filter(isDefined));
    set(
      getReportCustomerFilterAtom,
      (filters.customerIds ?? []).filter(isDefined),
    );
    set(
      getReportCompanyFilterAtom,
      (filters.companyIds ?? []).filter(isDefined),
    );
    set(
      getReportPriorityFilterAtom,
      (filters.priority ?? []).filter(isDefined),
    );
    set(getReportPropertyFilterAtom, toPropertyFilters(filters));

    if (isResponsesChartType(chart.visualType)) {
      set(getReportChartTypeAtom, chart.visualType);
    }

    setRestored(true);
  }, [cardId, chart, store]);

  return restored;
};
