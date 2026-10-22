import { Alert, cn, isDefined } from 'erxes-ui';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { useTicketDate } from '@/report/hooks/useTicketOpenDate';
import { SelectChartType } from '../select-chart-type/SelectChartType';
import { ReportChart, ResponsesChartType } from '@/report/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { DateCountChart } from '../chart/DateCountCharts';
import {
  getReportChartTypeAtom,
  getReportFrequencyFilterAtom,
  reportChartTypeState,
} from '@/report/states';
import { TicketReportFilter } from '../filter-popover/ticket-report-filter';
import {
  useChartPagination,
  ChartPagination,
} from '../chart-pagination/ChartPagination';
import { ChartExportButton } from '../chart-export/ChartExportButton';
import { ReportChartActions } from '../report-chart/ReportChartActions';
import { useTicketChartCard } from '@/report/hooks/useTicketChartCard';
import { TICKET_CHART_TYPES } from '@/report/types/component-registry';

interface TicketOpenDateProps {
  title: string;
  cardId?: string;
  savedChart?: ReportChart;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

export const TicketOpenDate = ({
  title,
  cardId,
  savedChart,
  colSpan = 6,
  onColSpanChange,
}: TicketOpenDateProps) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.report' });
  const { id, filterConfig, queryFilters, filtersRestored } =
    useTicketChartCard({ title, cardId, savedChart });
  const setChartType = useSetAtom(getReportChartTypeAtom(id));
  const chartType =
    useAtomValue(reportChartTypeState)[id] ?? ResponsesChartType.Table;
  const [frequency] = useAtom(getReportFrequencyFilterAtom(id));

  const { ticketDate, loading, error } = useTicketDate({
    skip: !filtersRestored,
    variables: {
      filters: {
        ...queryFilters,
        frequency,
      },
    },
  });

  const allData = useMemo(
    () =>
      (ticketDate ?? [])
        .filter(isDefined)
        .map((row) => ({ date: row.date ?? '', count: row.count ?? 0 })),
    [ticketDate],
  );
  const {
    pagedData: chartData,
    page,
    totalPages,
    totalCount,
    handlePrev,
    handleNext,
  } = useChartPagination(allData);

  const exportColumns = useMemo(
    () => [
      { key: 'date' as const, header: 'Date' },
      { key: 'count' as const, header: 'Count' },
    ],
    [],
  );

  const filterEl = (
    <>
      <TicketReportFilter cardId={id} />
      <SelectChartType value={chartType} onValueChange={setChartType} />
      <ReportChartActions
        chartType={TICKET_CHART_TYPES.date}
        visualType={chartType}
        colSpan={colSpan}
        filters={filterConfig}
        savedChart={savedChart}
      />
      <ChartExportButton
        data={allData}
        columns={exportColumns}
        filename="ticket-date"
      />
    </>
  );

  if (loading || !filtersRestored) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description={t('tickets-opened-over-time')}
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header filter={filterEl} />
        <FrontlineCard.Skeleton />
      </FrontlineCard>
    );
  }

  if (error) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description={t('tickets-opened-over-time')}
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Content>
          <Alert variant="destructive">
            <Alert.Title>
              {t('error-loading-data', 'Error loading data')}
            </Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert>
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  const renderChart = () => {
    if (!chartData.length) return <FrontlineCard.Empty />;
    return (
      <DateCountChart
        chartType={chartType}
        chartData={chartData}
        gradientId="tk-open-primary"
      />
    );
  };

  return (
    <FrontlineCard
      id={id}
      title={title}
      description={t('tickets-opened-over-time')}
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header filter={filterEl} />
      <FrontlineCard.Content>
        <div
          className={cn(
            { 'p-4': chartType !== ResponsesChartType.Table },
            'size-full flex-1 flex-col flex',
          )}
        >
          {renderChart()}
        </div>
        <ChartPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};
