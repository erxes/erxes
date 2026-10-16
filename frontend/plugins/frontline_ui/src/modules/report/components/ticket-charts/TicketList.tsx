import { Alert, Button, RecordTable, isDefined } from 'erxes-ui';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { useTicketList, TicketListItem } from '@/report/hooks/useTicketList';
import { memo, useState, useCallback, useMemo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IconDownload } from '@tabler/icons-react';
import { TicketReportFilter } from '../filter-popover/ticket-report-filter';
import { useTicketExport } from '@/report/hooks/useTicketExport';
import { generateTicketExcel, downloadExcel } from '@/report/utils/exportCsv';
import { ReportChartActions } from '../report-chart/ReportChartActions';
import { useTicketChartCard } from '@/report/hooks/useTicketChartCard';
import { ReportChart } from '@/report/types';
import { TICKET_CHART_TYPES } from '@/report/types/component-registry';
import { TicketsTotalCountContent } from '@/ticket/components/TicketsTotalCount';
import {
  TicketListColumnDefaults,
  TicketListVisibleColumn,
  useTicketExportColumns,
  useTicketListColumns,
} from './TicketListColumns';

const PER_PAGE = 10;

interface TicketListProps {
  title: string;
  cardId?: string;
  savedChart?: ReportChart;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

export const TicketList = ({
  title,
  cardId,
  savedChart,
  colSpan = 6,
  onColSpanChange,
}: TicketListProps) => {
  const { t } = useTranslation('frontline');
  const { id, filterConfig, queryFilters, filtersRestored } =
    useTicketChartCard({ title, cardId, savedChart });
  const { fetchExport, loading: exportLoading } = useTicketExport();
  const getExportColumns = useTicketExportColumns();
  const [visibleColumns, setVisibleColumns] =
    useState<TicketListVisibleColumn[]>();

  const {
    ticketList,
    isInitialLoad,
    isFetching,
    isFetchingMore,
    hasNextPage,
    handleFetchMore,
    fetchMoreError,
    error,
  } = useTicketList({
    skip: !filtersRestored,
    variables: { filters: { ...queryFilters, page: 1, limit: PER_PAGE } },
  });

  const handleExport = useCallback(async () => {
    const result = await fetchExport({
      variables: {
        filters: { ...queryFilters, limit: undefined },
      },
    });
    const tickets = result.data?.reportTicketExport?.filter(isDefined);
    if (tickets?.length && visibleColumns) {
      const buffer = await generateTicketExcel(
        tickets,
        getExportColumns(visibleColumns),
      );
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadExcel(buffer, `ticket-list-${timestamp}.xlsx`);
    }
  }, [fetchExport, queryFilters, getExportColumns, visibleColumns]);

  const canExport = Boolean(
    filtersRestored && !error && ticketList?.totalCount && visibleColumns,
  );
  const filterEl = useMemo(
    () => (
      <>
        <ReportChartActions
          chartType={TICKET_CHART_TYPES.list}
          colSpan={colSpan}
          filters={filterConfig}
          savedChart={savedChart}
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handleExport}
          disabled={exportLoading || !canExport}
          title={t('export-excel', 'Export Excel')}
        >
          <IconDownload className="size-3.5" />
        </Button>
      </>
    ),
    [
      handleExport,
      exportLoading,
      canExport,
      t,
      colSpan,
      filterConfig,
      savedChart,
    ],
  );

  let description = t('ticket-list', 'Ticket list');
  let content: ReactNode;
  if (isInitialLoad || !filtersRestored) {
    content = <FrontlineCard.Skeleton />;
  } else if (error) {
    content = (
      <Alert variant="destructive">
        <Alert.Title>
          {t('error-loading-data', 'Error loading data')}
        </Alert.Title>
        <Alert.Description>{error.message}</Alert.Description>
      </Alert>
    );
  } else if (!ticketList?.list.length) {
    description = t('no-tickets-found', 'No tickets found');
    content = <FrontlineCard.Empty />;
  } else {
    description = t('ticket-count', '{{count}} tickets', {
      count: ticketList.totalCount,
    });
    content = (
      <>
        <div
          className={isFetching ? 'opacity-50 pointer-events-none' : undefined}
        >
          <TicketListTable
            key={JSON.stringify(queryFilters)}
            tickets={ticketList.list}
            page={ticketList.page}
            hasNextPage={hasNextPage && !fetchMoreError}
            isFetchingMore={isFetchingMore}
            handleFetchMore={handleFetchMore}
            onVisibleColumnsChange={setVisibleColumns}
          />
        </div>
        <div className="px-4 py-3 border-t text-xs text-muted-foreground">
          {t('pagination-range', '{{from}}–{{to}} of {{total}}', {
            from: 1,
            to: ticketList.list.length,
            total: ticketList.totalCount,
          })}
        </div>
        {fetchMoreError && (
          <Alert variant="destructive" className="mt-2">
            <Alert.Title>
              {t('error-loading-data', 'Error loading data')}
            </Alert.Title>
            <Alert.Description>{fetchMoreError}</Alert.Description>
            <Button variant="outline" size="sm" onClick={handleFetchMore}>
              {t('retry', 'Retry')}
            </Button>
          </Alert>
        )}
      </>
    );
  }

  return (
    <FrontlineCard
      id={id}
      title={title}
      description={description}
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header
        filter={filterEl}
        titleAccessory={
          <TicketReportFilter cardId={id} showBar>
            {!error && (
              <TicketsTotalCountContent
                totalCount={
                  filtersRestored && !isFetching
                    ? ticketList?.totalCount
                    : undefined
                }
              />
            )}
          </TicketReportFilter>
        }
      />
      <FrontlineCard.Content>{content}</FrontlineCard.Content>
    </FrontlineCard>
  );
};

const TicketListTable = memo(function TicketListTable({
  tickets,
  page,
  hasNextPage,
  isFetchingMore,
  handleFetchMore,
  onVisibleColumnsChange,
}: {
  tickets: TicketListItem[];
  page: number;
  hasNextPage: boolean;
  isFetchingMore: boolean;
  handleFetchMore: () => Promise<void>;
  onVisibleColumnsChange: (columns: TicketListVisibleColumn[]) => void;
}) {
  const columns = useTicketListColumns();
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  return (
    <div className="bg-sidebar w-full rounded-lg">
      <RecordTable.Provider
        data={tickets}
        columns={columns}
        className="m-3"
        tableId="frontline_ticket_report_record_table"
      >
        <RecordTable.Scroll
          ref={setScrollRoot}
          className="h-[calc(var(--spacing-cell)*11+0.75rem)]"
        >
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {hasNextPage && (
                <RecordTable.RowSkeleton
                  key={page}
                  root={scrollRoot}
                  handleInView={isFetchingMore ? undefined : handleFetchMore}
                />
              )}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
        <TicketListColumnDefaults
          onVisibleColumnsChange={onVisibleColumnsChange}
        />
      </RecordTable.Provider>
    </div>
  );
});
