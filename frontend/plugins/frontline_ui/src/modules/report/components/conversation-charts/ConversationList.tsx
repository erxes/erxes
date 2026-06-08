import { Cell, ColumnDef } from '@tanstack/react-table';
import { useConversationList } from '@/report/hooks/useConversationList';
import { useConversationExport } from '@/report/hooks/useConversationExport';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { getFilters } from '@/report/utils/dateFilters';
import {
  Alert,
  Badge,
  Button,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { ConversationListItem } from '@/report/types';
import { formatDate } from 'date-fns';
import { CustomersInline, MembersInline } from 'ui-modules';
import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconMessageShare,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import {
  getReportCallStatusFilterAtom,
  getReportDateFilterAtom,
  getReportSourceFilterAtom,
  getReportChannelFilterAtom,
  getReportMemberFilterAtom,
} from '@/report/states';
import { ReportFilter } from '../filter-popover/report-filter';
import {
  generateConversationExcel,
  downloadExcel,
} from '@/report/utils/exportCsv';

interface ConversationListProps {
  title: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

export const ConversationList = ({
  title,
  colSpan = 6,
  onColSpanChange,
}: ConversationListProps) => {
  const id = title.toLowerCase().replace(/\s+/g, '-');
  const [dateValue, setDateValue] = useAtom(getReportDateFilterAtom(id));
  const [sourceFilter, setSourceFilter] = useAtom(
    getReportSourceFilterAtom(id),
  );
  const [channelFilter, setChannelFilter] = useAtom(
    getReportChannelFilterAtom(id),
  );
  const [memberFilter, setMemberFilter] = useAtom(
    getReportMemberFilterAtom(id),
  );
  const [callStatusFilter] = useAtom(getReportCallStatusFilterAtom(id));
  const [filters, setFilters] = useState(() => getFilters());
  const [page, setPage] = useState(1);
  const { fetchExport, loading: exportLoading } = useConversationExport();

  useEffect(() => {
    setFilters(getFilters(dateValue || undefined));
    setPage(1);
  }, [dateValue]);

  useEffect(() => {
    setPage(1);
  }, [sourceFilter, channelFilter, memberFilter]);

  const activeFilters = {
    ...filters,
    page,
    limit: 20,
    channelIds: channelFilter.length ? channelFilter : undefined,
    memberIds: memberFilter.length ? memberFilter : undefined,
    source: sourceFilter !== 'all' ? sourceFilter : undefined,
    callStatus:
      sourceFilter === 'calls' && callStatusFilter !== 'all'
        ? callStatusFilter
        : undefined,
  };

  const handleExport = useCallback(async () => {
    const result = await fetchExport({ variables: { filters: activeFilters } });
    const conversations = result.data?.reportConversationExport;
    if (conversations?.length) {
      const buffer = await generateConversationExcel(conversations);
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadExcel(buffer, `conversation-list-${timestamp}.xlsx`);
    }
  }, [fetchExport, activeFilters]);

  const filterEl = useMemo(
    () => (
      <>
        <ReportFilter cardId={id} />
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
    ),
    [id, handleExport, exportLoading],
  );

  const { conversationList, loading, error } = useConversationList({
    variables: { filters: activeFilters },
  });

  if (loading) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="Total conversations open in the last 30 days"
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
        description="Total conversations open in the last 30 days"
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Content>
          <Alert variant="destructive">
            <Alert.Title>Error loading data</Alert.Title>
            <Alert.Description>
              {error.message || 'Failed to load conversation list'}
            </Alert.Description>
          </Alert>
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  if (!conversationList?.list || conversationList.list.length === 0) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="No conversations found."
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

  const { totalCount, totalPages } = conversationList;

  return (
    <FrontlineCard
      id={id}
      title={title}
      description={`${totalCount} conversations`}
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header filter={filterEl} />
      <FrontlineCard.Content>
        <ConversationListTable conversationList={conversationList.list} />
        <ConversationPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};

const ConversationListTable = memo(function ConversationListTable({
  conversationList,
}: {
  conversationList: ConversationListItem[];
}) {
  return (
    <div className="bg-sidebar w-full rounded-lg [&_th]:last-of-type:text-right">
      <RecordTable.Provider
        data={conversationList}
        columns={conversationListColumns}
        className="m-3"
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

const PER_PAGE = 20;

const ConversationPagination = memo(function ConversationPagination({
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
  const navigate = useNavigate();
  const from = (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, totalCount);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <span className="text-xs text-muted-foreground">
        {from}–{to} of {totalCount}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={page <= 1}
        >
          <IconChevronLeft className="size-4" />
          Prev
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
          Next
          <IconChevronRight className="size-4" />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs"
        onClick={() => navigate('/frontline/inbox')}
      >
        Go to conversations
      </Button>
    </div>
  );
});

export const conversationListColumns: ColumnDef<ConversationListItem>[] = [
  {
    id: 'createdAt',
    header: 'Created At',
    accessorKey: 'createdAt',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <span className="text-xs text-muted-foreground">
            {formatDate(cell.getValue() as string, 'dd/MM/yyyy HH:mm')}
          </span>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'customerId',
    header: 'Customer',
    accessorKey: 'customerId',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <CustomersInline.Provider customerIds={[cell.getValue() as string]}>
            <CustomersInline.Avatar size="sm" />
            <CustomersInline.Title className="text-xs text-muted-foreground" />
          </CustomersInline.Provider>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'userId',
    header: 'Last Conversation by',
    accessorKey: 'userId',
    size: 100,
    cell: ({ cell }) => {
      const { userId } = cell.row.original || {};
      if (!userId) {
        return (
          <RecordTableInlineCell className="flex items-center justify-center">
            <Badge variant="secondary" className="text-xs">
              Customer
            </Badge>
          </RecordTableInlineCell>
        );
      }
      return (
        <RecordTableInlineCell className="flex items-center justify-center">
          <Badge variant="secondary" className="text-xs">
            Member
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    size: 100,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="flex items-center justify-center">
          <Badge>{cell.getValue() as string}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'assignedUserId',
    header: 'Assigned to',
    accessorKey: 'assignedUserId',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <MembersInline.Provider memberIds={[cell.getValue() as string]}>
            <MembersInline.Avatar size="sm" />
            <MembersInline.Title className="text-xs text-muted-foreground" />
          </MembersInline.Provider>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'readUsers',
    header: 'Opened by',
    accessorKey: 'readUsers',
    cell: ({ cell }) => {
      const { readUsers } = cell.row.original || {};
      if (!readUsers) {
        return <RecordTableInlineCell>N/A</RecordTableInlineCell>;
      }
      return (
        <RecordTableInlineCell>
          <MembersInline.Provider memberIds={readUsers.map((user) => user._id)}>
            <MembersInline.Avatar size="sm" />
            <MembersInline.Title className="text-xs text-muted-foreground" />
          </MembersInline.Provider>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'open',
    size: 33,
    cell: ({ cell }) => <MoreCell cell={cell} />,
  },
];

export const MoreCell = ({
  cell,
}: {
  cell: Cell<ConversationListItem, any>;
}) => {
  const { _id } = cell.row.original || {};
  const navigate = useNavigate();
  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        navigate(`/frontline/inbox?conversationId=${_id}`);
      }}
    >
      <IconMessageShare />
    </RecordTable.MoreButton>
  );
};
