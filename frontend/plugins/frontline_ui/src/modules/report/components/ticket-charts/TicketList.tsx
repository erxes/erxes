import { Alert, Button, RecordTable } from 'erxes-ui';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { useTicketList, TicketListItem } from '@/report/hooks/useTicketList';
import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
} from '@tabler/icons-react';
import { TicketReportFilter } from '../filter-popover/ticket-report-filter';
import { useTicketExport } from '@/report/hooks/useTicketExport';
import { generateTicketExcel, downloadExcel } from '@/report/utils/exportCsv';
import { ReportChartActions } from '../report-chart/ReportChartActions';
import { useTicketChartCard } from '@/report/hooks/useTicketChartCard';
import { ReportChart } from '@/report/types';
import { TICKET_CHART_TYPES } from '@/report/types/component-registry';
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
  const [page, setPage] = useState(1);
  const { fetchExport, loading: exportLoading } = useTicketExport();
  const getExportColumns = useTicketExportColumns();
  const [visibleColumns, setVisibleColumns] =
    useState<TicketListVisibleColumn[]>();

  useEffect(() => {
    setPage(1);
  }, [queryFilters]);

  const { ticketList, isInitialLoad, isFetching, error } = useTicketList({
    skip: !filtersRestored,
    variables: {
      filters: {
        ...queryFilters,
        page,
        limit: PER_PAGE,
      },
    },
  });

  const handlePrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const handleNext = useCallback(() => setPage((p) => p + 1), []);

  const handleExport = useCallback(async () => {
    const result = await fetchExport({
      variables: {
        filters: { ...queryFilters, limit: undefined },
      },
    });
    const tickets = result.data?.reportTicketExport;
    if (tickets?.length && visibleColumns) {
      const buffer = await generateTicketExcel(
        tickets,
        getExportColumns(visibleColumns),
      );
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadExcel(buffer, `ticket-list-${timestamp}.xlsx`);
    }
  }, [fetchExport, queryFilters, getExportColumns, visibleColumns]);

  const filterEl = useMemo(
    () => (
      <>
        <TicketReportFilter cardId={id} />
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
          disabled={exportLoading || !visibleColumns}
          title={t('export-excel', 'Export Excel')}
        >
          <IconDownload className="size-3.5" />
        </Button>
      </>
    ),
    [
      id,
      handleExport,
      exportLoading,
      visibleColumns,
      t,
      colSpan,
      filterConfig,
      savedChart,
    ],
  );

  if (isInitialLoad || !filtersRestored) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description={t('ticket-list', 'Ticket list')}
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header filter={filterEl} />
        <FrontlineCard.Content>
          <FrontlineCard.Skeleton />
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  if (error) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description={t('ticket-list', 'Ticket list')}
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

  if (!ticketList?.list || ticketList.list.length === 0) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description={t('no-tickets-found', 'No tickets found')}
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header filter={filterEl} />
        <FrontlineCard.Content>
          <FrontlineCard.Empty />
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  const { totalCount, totalPages } = ticketList;

  return (
    <FrontlineCard
      id={id}
      title={title}
      description={t('ticket-count', '{{count}} tickets', {
        count: totalCount,
      })}
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header filter={filterEl} />
      <FrontlineCard.Content>
        <div
          className={isFetching ? 'opacity-50 pointer-events-none' : undefined}
        >
          <TicketListTable
            tickets={ticketList.list}
            onVisibleColumnsChange={setVisibleColumns}
          />
        </div>
        <Pagination
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

const Pagination = memo(function Pagination({
  page,
  totalPages,
  totalCount,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation('frontline');
  const from = (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, totalCount);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <span className="text-xs text-muted-foreground">
        {t('pagination-range', '{{from}}–{{to}} of {{total}}', {
          from,
          to,
          total: totalCount,
        })}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={page <= 1}
        >
          <IconChevronLeft className="size-4" />
          {t('prev', 'Prev')}
        </Button>
        <span className="text-xs text-muted-foreground px-2">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages}
        >
          {t('next', 'Next')}
          <IconChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
});

const TicketListTable = memo(function TicketListTable({
  tickets,
  onVisibleColumnsChange,
}: {
  tickets: TicketListItem[];
  onVisibleColumnsChange: (columns: TicketListVisibleColumn[]) => void;
}) {
  const columns = useTicketListColumns();
  return (
    <div className="bg-sidebar w-full rounded-lg [&_th]:last-of-type:text-right">
      <RecordTable.Provider
        data={tickets}
        columns={columns}
        className="m-3"
        tableId="frontline_ticket_report_record_table"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
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
