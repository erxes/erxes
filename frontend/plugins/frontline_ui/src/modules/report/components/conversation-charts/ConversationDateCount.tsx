import { isDefined, cn } from 'erxes-ui';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { FrontlineChartCard } from '../frontline-card/FrontlineChartCard';
import { useConversationReportsByStatus } from '../../hooks/useConversationReportsByStatus';
import { useConversationResolvedByDate } from '@/report/hooks/useConversationResolvedByDate';
import { SelectChartType } from '../select-chart-type/SelectChartType';
import { ReportChart, ResponsesChartType } from '@/report/types';
import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { getReportChartTypeAtom } from '@/report/states';
import { ReportFilter } from '../filter-popover/report-filter';
import { ChartExportButton } from '../chart-export/ChartExportButton';
import {
  useChartPagination,
  ChartPagination,
} from '../chart-pagination/ChartPagination';
import { ReportChartActions } from '../report-chart/ReportChartActions';
import { useConversationChartCard } from '@/report/hooks/useConversationChartCard';
import {
  DateCountChart,
  DATE_COUNT_EXPORT_COLUMNS,
} from '../chart/DateCountCharts';
import { useTranslation } from 'react-i18next';

export interface ConversationDateCountProps {
  title: string;
  cardId?: string;
  savedChart?: ReportChart;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

const DATE_COUNT_REPORTS = {
  open: { chartType: 'conversation-open', gradientId: 'fl-open-primary' },
  resolved: {
    chartType: 'conversation-resolved',
    gradientId: 'fl-resolved-primary',
  },
} as const;

// Open and resolved conversation counts per day share one card.
export const ConversationDateCount = ({
  kind,
  title,
  cardId,
  savedChart,
  colSpan = 6,
  onColSpanChange,
}: Readonly<ConversationDateCountProps & { kind: 'open' | 'resolved' }>) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.report' });
  const { id, filterConfig, queryFilters, filtersRestored } =
    useConversationChartCard({ title, cardId, savedChart });
  const [chartType, setChartType] = useAtom(getReportChartTypeAtom(id));

  const { chartType: reportType, gradientId } = DATE_COUNT_REPORTS[kind];
  const description =
    kind === 'open'
      ? t('total-conversations-open-last-30-days')
      : t('total-conversations-resolved-last-30-days');
  const queryOptions = {
    variables: { filters: queryFilters },
    notifyOnNetworkStatusChange: true,
  };
  const open = useConversationReportsByStatus({
    ...queryOptions,
    skip: !filtersRestored || kind !== 'open',
  });
  const resolved = useConversationResolvedByDate({
    ...queryOptions,
    skip: !filtersRestored || kind !== 'resolved',
  });
  const loading = kind === 'open' ? open.loading : resolved.loading;
  const rows =
    kind === 'open'
      ? open.reports?.reportConversationOpenDate
      : resolved.reports?.reportConversationResolvedDate;

  const allData = useMemo(
    () =>
      (rows ?? [])
        .filter(isDefined)
        .map((row) => ({ date: row.date ?? '', count: row.count ?? 0 })),
    [rows],
  );
  const {
    pagedData: chartData,
    page,
    totalPages,
    totalCount,
    handlePrev,
    handleNext,
  } = useChartPagination(allData);

  const filterEl = (
    <>
      <ReportFilter cardId={id} />
      <SelectChartType value={chartType} onValueChange={setChartType} />
      <ReportChartActions
        chartType={reportType}
        visualType={chartType}
        colSpan={colSpan}
        filters={filterConfig}
        savedChart={savedChart}
      />
      <ChartExportButton
        data={allData}
        columns={DATE_COUNT_EXPORT_COLUMNS}
        filename={reportType}
      />
    </>
  );

  return (
    <FrontlineChartCard
      id={id}
      title={title}
      description={description}
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
      filter={filterEl}
      loading={loading || !filtersRestored}
    >
      <FrontlineCard.Content>
        <div
          className={cn(
            {
              'p-4': chartType !== ResponsesChartType.Table,
            },
            'size-full flex-1 flex-col flex',
          )}
        >
          {chartData && chartData.length > 0 ? (
            <DateCountChart
              chartType={chartType}
              chartData={chartData}
              gradientId={gradientId}
            />
          ) : (
            <FrontlineCard.Empty />
          )}
        </div>
        <ChartPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </FrontlineCard.Content>
    </FrontlineChartCard>
  );
};
