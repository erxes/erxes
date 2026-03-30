import { Alert, Badge, Button, RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { useTicketList, TicketListItem } from '@/report/hooks/useTicketList';
import { getFilters } from '@/report/utils/dateFilters';
import { formatDate } from 'date-fns';
import { MembersInline } from 'ui-modules';
import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { IconTicket, IconChevronLeft, IconChevronRight, IconDownload } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import {
  getReportDateFilterAtom,
  getReportChannelFilterAtom,
  getReportMemberFilterAtom,
  getReportPipelineFilterAtom,
  getReportStateFilterAtom,
  getReportPriorityFilterAtom,
  getReportTicketTagFilterAtom,
  getReportCustomerFilterAtom,
  getReportCompanyFilterAtom,
} from '@/report/states';
import { TicketReportFilter } from '../filter-popover/ticket-report-filter';
import { ColumnDef, Cell } from '@tanstack/react-table';
import { PROJECT_PRIORITIES_OPTIONS } from '@/ticket/constants/priorityOption';
import { useTicketExport } from '@/report/hooks/useTicketExport';
import { generateTicketExcel, downloadExcel } from '@/report/utils/exportCsv';

const PER_PAGE = 20;

interface TicketListProps {
  title: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

export const TicketList = ({ title, colSpan = 6, onColSpanChange }: TicketListProps) => {
  const id = title.toLowerCase().replace(/\s+/g, '-');
  const [dateValue] = useAtom(getReportDateFilterAtom(id));
  const [channelFilter] = useAtom(getReportChannelFilterAtom(id));
  const [memberFilter] = useAtom(getReportMemberFilterAtom(id));
  const [pipelineFilter] = useAtom(getReportPipelineFilterAtom(id));
  const [stateFilter] = useAtom(getReportStateFilterAtom(id));
  const [priorityFilter] = useAtom(getReportPriorityFilterAtom(id));
  const [tagFilter] = useAtom(getReportTicketTagFilterAtom(id));
  const [customerFilter] = useAtom(getReportCustomerFilterAtom(id));
  const [companyFilter] = useAtom(getReportCompanyFilterAtom(id));
  const [filters, setFilters] = useState(() => getFilters());
  const [page, setPage] = useState(1);
  const { fetchExport, loading: exportLoading } = useTicketExport();

  useEffect(() => {
    setFilters(getFilters(dateValue || undefined));
    setPage(1);
  }, [dateValue]);

  useEffect(() => {
    setPage(1);
  }, [
    channelFilter,
    memberFilter,
    pipelineFilter,
    stateFilter,
    priorityFilter,
    tagFilter,
    customerFilter,
    companyFilter,
  ]);

  const { ticketList, loading, error } = useTicketList({
    variables: {
      filters: {
        ...filters,
        page,
        limit: PER_PAGE,
        channelIds: channelFilter.length ? channelFilter : undefined,
        memberIds: memberFilter.length ? memberFilter : undefined,
        pipelineIds: pipelineFilter.length ? pipelineFilter : undefined,
        state: stateFilter || undefined,
        priority: priorityFilter.length ? priorityFilter : undefined,
        tagIds: tagFilter.length ? tagFilter : undefined,
        customerIds: customerFilter.length ? customerFilter : undefined,
        companyIds: companyFilter.length ? companyFilter : undefined,
      },
    },
  });

  const handlePrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const handleNext = useCallback(() => setPage((p) => p + 1), []);

  const handleExport = useCallback(async () => {
    const result = await fetchExport({
      variables: {
        filters: {
          ...filters,
          limit: undefined,
          channelIds: channelFilter.length ? channelFilter : undefined,
          memberIds: memberFilter.length ? memberFilter : undefined,
          pipelineIds: pipelineFilter.length ? pipelineFilter : undefined,
          state: stateFilter || undefined,
          priority: priorityFilter.length ? priorityFilter : undefined,
          tagIds: tagFilter.length ? tagFilter : undefined,
          customerIds: customerFilter.length ? customerFilter : undefined,
          companyIds: companyFilter.length ? companyFilter : undefined,
        },
      },
    });
    const tickets = result.data?.reportTicketExport;
    if (tickets?.length) {
      const buffer = await generateTicketExcel(tickets);
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadExcel(buffer, `ticket-list-${timestamp}.xlsx`);
    }
  }, [
    fetchExport, filters, channelFilter, memberFilter, pipelineFilter,
    stateFilter, priorityFilter, tagFilter, customerFilter, companyFilter,
  ]);

  const filterEl = useMemo(() => (
    <>
      <TicketReportFilter cardId={id} />
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={handleExport}
        disabled={exportLoading}
        title="Export Excel"
      >
        <IconDownload className="size-3.5" />
      </Button>
    </>
  ), [id, handleExport, exportLoading]);

  if (loading) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="Ticket list"
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
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
        description="Ticket list"
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Content>
          <Alert variant="destructive">
            <Alert.Title>Error loading data</Alert.Title>
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
        description="No tickets found."
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
      description={`${totalCount} tickets`}
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header filter={filterEl} />
      <FrontlineCard.Content>
        <TicketListTable tickets={ticketList.list} />
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
  const from = (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, totalCount);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <span className="text-xs text-muted-foreground">
        {from}–{to} of {totalCount}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={page <= 1}>
          <IconChevronLeft className="size-4" />
          Prev
        </Button>
        <span className="text-xs text-muted-foreground px-2">
          {page} / {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages}>
          Next
          <IconChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
});

const TicketListTable = memo(function TicketListTable({ tickets }: { tickets: TicketListItem[] }) {
  return (
    <div className="bg-sidebar w-full rounded-lg [&_th]:last-of-type:text-right">
      <RecordTable.Provider data={tickets} columns={ticketListColumns} className="m-3">
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
    id: 'priority',
    header: 'Priority',
    accessorKey: 'priority',
    size: 80,
    cell: ({ cell }) => {
      const priority = cell.getValue() as number;
      const label = PROJECT_PRIORITIES_OPTIONS[priority] || 'Unknown';
      return (
        <RecordTableInlineCell className="flex items-center justify-center">
          <Badge variant="secondary" className="text-xs">
            {label}
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
    accessorKey: 'assigneeId',
    cell: ({ cell }) => {
      const assigneeId = cell.getValue() as string;
      if (!assigneeId)
        return (
          <RecordTableInlineCell className="text-xs text-muted-foreground">
            Unassigned
          </RecordTableInlineCell>
        );
      return (
        <RecordTableInlineCell>
          <MembersInline.Provider memberIds={[assigneeId]}>
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
    size: 33,
    cell: ({ cell }) => <TicketMoreCell cell={cell} />,
  },
];

const TicketMoreCell = ({ cell }: { cell: Cell<TicketListItem, any> }) => {
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
