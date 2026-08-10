import { useMemo } from 'react';
import {
  useRestoreTicketChartFilters,
  useTicketChartFilterConfig,
} from '@/report/hooks/useTicketChartFilterConfig';
import { ReportChart } from '@/report/types';
import { getFilters } from '@/report/utils/dateFilters';

interface TicketChartCardOptions {
  title: string;
  cardId?: string;
  savedChart?: ReportChart;
}

export const useTicketChartCard = ({
  title,
  cardId,
  savedChart,
}: TicketChartCardOptions) => {
  const id = cardId || title.toLowerCase().replace(/\s+/g, '-');
  const filtersRestored = useRestoreTicketChartFilters(id, savedChart);
  const filterConfig = useTicketChartFilterConfig(id);

  const queryFilters = useMemo(() => {
    const { date, ...rest } = filterConfig;

    return { ...getFilters(date || undefined), ...rest };
  }, [filterConfig]);

  return { id, filterConfig, queryFilters, filtersRestored };
};
