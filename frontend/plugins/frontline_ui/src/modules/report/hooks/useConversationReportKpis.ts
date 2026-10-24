import { useConversationClosed } from '@/report/hooks/useConversationClose';
import { useConversationOpen } from '@/report/hooks/useConversationOpen';
import { useConversationSources } from '@/report/hooks/useConversationSource';
import { useMemo } from 'react';
import { getTopSource } from '@/report/utils';
import { useAtomValue } from 'jotai';
import { getReportDateFilterAtom } from '@/report/states';
import { getFilters } from '@/report/utils/dateFilters';
import { OVERVIEW_KPI_DATE_FILTER_ID } from '@/report/components/filter-popover/ReportKpiDateFilter';
import type { ConversationReportKpiData } from '@/report/types/conversationReportKpis';

export const useConversationReportKpis = (): ConversationReportKpiData => {
  const kpiDate = useAtomValue(
    getReportDateFilterAtom(OVERVIEW_KPI_DATE_FILTER_ID),
  );
  const kpiFilters = useMemo(() => getFilters(kpiDate || undefined), [kpiDate]);
  const {
    conversationOpen,
    loading: openLoading,
    error: openError,
  } = useConversationOpen({
    variables: { filters: kpiFilters },
  });
  const {
    conversationClosed,
    loading: closedLoading,
    error: closedError,
  } = useConversationClosed({
    variables: { filters: kpiFilters },
  });
  const {
    conversationSources = [],
    loading: sourcesLoading,
    error: sourcesError,
  } = useConversationSources({
    variables: {
      filters: {
        ...kpiFilters,
        limit: 10,
      },
    },
  });
  const sources = Array.isArray(conversationSources) ? conversationSources : [];
  const topPerformingSource = getTopSource(sources);
  const topConvertingSource = getTopSource(sources);
  const kpiError = openError || closedError || sourcesError;
  const kpiLoading = openLoading || closedLoading || sourcesLoading;

  return {
    conversationOpen,
    conversationClosed,
    topPerformingSource,
    topConvertingSource,
    kpiError,
    kpiLoading,
  };
};
