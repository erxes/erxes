import {
  Alert,
  Badge,
  Button,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { useTicketList, TicketListItem } from '@/report/hooks/useTicketList';
import { formatDate } from 'date-fns';
import { MembersInline } from 'ui-modules';
import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconTicket,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
} from '@tabler/icons-react';
import { StatusInlineIcon } from '@/status/components/StatusInline';
import { useNavigate } from 'react-router-dom';
import { TicketReportFilter } from '../filter-popover/ticket-report-filter';
import { ColumnDef, Cell } from '@tanstack/react-table';
import { useTicketExport } from '@/report/hooks/useTicketExport';
import { generateTicketExcel, downloadExcel } from '@/report/utils/exportCsv';
import { ReportChartActions } from '../report-chart/ReportChartActions';
import { useTicketChartCard } from '@/report/hooks/useTicketChartCard';
import { ReportChart } from '@/report/types';
import { TICKET_CHART_TYPES } from '@/report/types/component-registry';

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
    if (tickets?.length) {
      const buffer = await generateTicketExcel(tickets);
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadExcel(buffer, `ticket-list-${timestamp}.xlsx`);
    }
  }, [fetchExport, queryFilters]);

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
          disabled={exportLoading}
          title={t('export-excel')}
        >
          <IconDownload className="size-3.5" />
        </Button>
      </>
    ),
    [id, handleExport, exportLoading, t, colSpan, filterConfig, savedChart],
  );

  if (isInitialLoad || !filtersRestored) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description={t('ticket-list')}
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
        description={t('ticket-list')}
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Content>
          <Alert variant="destructive">
            <Alert.Title>{t('error-loading-data')}</Alert.Title>
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
        description={t('no-tickets-found')}
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
      description={t('ticket-count', { count: totalCount })}
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header filter={filterEl} />
      <FrontlineCard.Content>
        <div
          className={isFetching ? 'opacity-50 pointer-events-none' : undefined}
        >
          <TicketListTable tickets={ticketList.list} />
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
        {t('pagination-range', { from, to, total: totalCount })}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={page <= 1}
        >
          <IconChevronLeft className="size-4" />
          {t('prev')}
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
          {t('next')}
          <IconChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
});

const TicketListTable = memo(function TicketListTable({
  tickets,
}: {
  tickets: TicketListItem[];
}) {
  return (
    <div className="bg-sidebar w-full rounded-lg [&_th]:last-of-type:text-right">
      <RecordTable.Provider
        data={tickets}
        columns={ticketListColumns}
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
      </RecordTable.Provider>
    </div>
  );
});

export const ticketListColumns: ColumnDef<TicketListItem>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    cell: ({ cell }) => (
      <RecordTableInlineCell className="px-4 text-xs font-medium">
        {cell.getValue() as string}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <span className="text-xs text-muted-foreground">
          {formatDate(cell.getValue() as string, 'dd/MM/yyyy HH:mm')}
        </span>
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    size: 160,
    cell: ({ cell }) => {
      const status = cell.getValue<TicketListItem['status']>();

      if (!status) {
        return (
          <RecordTableInlineCell className="flex items-center justify-center">
            <span className="text-xs text-muted-foreground">—</span>
          </RecordTableInlineCell>
        );
      }

      return (
        <RecordTableInlineCell className="flex items-center justify-center">
          <Badge
            variant="secondary"
            className="text-xs gap-1 max-w-40 truncate"
            style={{
              backgroundColor: status.color ? `${status.color}1a` : undefined,
              color: status.color,
            }}
          >
            <StatusInlineIcon
              statusType={status.type}
              color={status.color}
              className="size-3"
            />
            <span className="truncate">{status.name}</span>
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'state',
    header: 'State',
    accessorKey: 'state',
    size: 80,
    cell: ({ cell }) => {
      const state = cell.getValue() as string | undefined;
      return (
        <RecordTableInlineCell className="flex items-center justify-center">
          {state ? (
            <Badge className="text-xs capitalize">{state}</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'assigneeId',
    header: 'Assigned',
    accessorKey: 'assigneeIds',
    cell: ({ cell }) => {
      const assigneeIds = (cell.getValue() as string[]) || [];
      if (!assigneeIds.length)
        return (
          <RecordTableInlineCell className="text-xs text-muted-foreground">
            Unassigned
          </RecordTableInlineCell>
        );
      return (
        <RecordTableInlineCell>
          <MembersInline.Provider memberIds={assigneeIds}>
            <MembersInline.Avatar size="sm" />
            <MembersInline.Title className="text-xs text-muted-foreground" />
          </MembersInline.Provider>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'targetDate',
    header: 'Due Date',
    accessorKey: 'targetDate',
    size: 100,
    cell: ({ cell }) => {
      const targetDate = cell.getValue() as string | undefined;
      return (
        <RecordTableInlineCell className="text-xs text-muted-foreground">
          {targetDate ? formatDate(targetDate, 'dd/MM/yyyy') : '—'}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'open',
    header: () => <RecordTable.ColumnSelector />,
    size: 33,
    cell: ({ cell }) => <TicketMoreCell cell={cell} />,
  },
];

const TicketMoreCell = ({ cell }: { cell: Cell<TicketListItem, unknown> }) => {
  const { _id } = cell.row.original || {};
  const navigate = useNavigate();
  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => navigate(`/frontline/tickets?ticketId=${_id}`)}
    >
      <IconTicket />
    </RecordTable.MoreButton>
  );
};
