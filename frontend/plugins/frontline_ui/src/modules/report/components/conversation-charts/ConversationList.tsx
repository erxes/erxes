import { Cell, ColumnDef } from '@tanstack/react-table';
import { useConversationList } from '@/report/hooks/useConversationList';
import { useConversationExport } from '@/report/hooks/useConversationExport';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import {
  Alert,
  Badge,
  Button,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { ConversationListItem, ReportChart } from '@/report/types';
import { formatDate } from 'date-fns';
import { CustomersInline, MembersInline } from 'ui-modules';
import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconMessageShare,
  IconDownload,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ReportFilter } from '../filter-popover/report-filter';
import ExcelJS from 'exceljs';
import { downloadExcel } from '@/report/utils/exportCsv';
import { ReportChartActions } from '../report-chart/ReportChartActions';
import { useConversationChartCard } from '@/report/hooks/useConversationChartCard';

const PER_PAGE = 10;

interface ConversationListProps {
  title: string;
  cardId?: string;
  savedChart?: ReportChart;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

const CONVERSATION_LIST_EXPORT_COLUMNS = [
  { key: 'content', header: 'Content', width: 40 },
  { key: 'status', header: 'Status', width: 14 },
  { key: 'assignedUserName', header: 'Assigned To', width: 22 },
  { key: 'customerName', header: 'Customer', width: 22 },
  { key: 'integrationName', header: 'Integration', width: 22 },
  { key: 'tagNames', header: 'Tags', width: 22 },
  { key: 'createdAt', header: 'Created At', width: 18 },
  { key: 'closedAt', header: 'Closed At', width: 18 },
] as const;

export const ConversationList = ({
  title,
  cardId,
  savedChart,
  colSpan = 6,
  onColSpanChange,
}: ConversationListProps) => {
  const { t } = useTranslation('frontline');
  const { id, filterConfig, queryFilters, filtersRestored } =
    useConversationChartCard({ title, cardId, savedChart });
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [queryFilters]);

  const { conversationList, isFetching, isInitialLoad, error } =
    useConversationList({
      variables: {
        filters: {
          ...queryFilters,
          page,
          limit: PER_PAGE,
        },
      },
      skip: !filtersRestored,
    });

  const handlePrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const handleNext = useCallback(() => setPage((p) => p + 1), []);

  const { fetchExport } = useConversationExport();

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const result = await fetchExport({
        variables: {
          filters: queryFilters,
        },
      });

      const items = result.data?.reportConversationExport || [];
      if (!items.length) return;

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Conversations');

      sheet.columns = CONVERSATION_LIST_EXPORT_COLUMNS.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width,
      }));

      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE9ECEF' },
      };

      const formatDateVal = (v?: string) => {
        if (!v) return '';
        try {
          return formatDate(new Date(v), 'yyyy-MM-dd HH:mm');
        } catch {
          return v;
        }
      };

      for (const item of items) {
        sheet.addRow({
          content: item.content || '',
          status: item.status || '',
          assignedUserName: item.assignedUserName || '',
          customerName: item.customerName || '',
          integrationName: item.integrationName || '',
          tagNames: (item.tagNames || []).join(', '),
          createdAt: formatDateVal(item.createdAt),
          closedAt: formatDateVal(item.closedAt),
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadExcel(buffer, `conversation-list-${timestamp}.xlsx`);
    } finally {
      setExporting(false);
    }
  }, [fetchExport, queryFilters]);

  const filterEl = useMemo(
    () => (
      <>
        <ReportFilter cardId={id} />
        <ReportChartActions
          chartType="conversation-list"
          colSpan={colSpan}
          filters={filterConfig}
          savedChart={savedChart}
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handleExport}
          disabled={exporting}
          title={t('export-excel')}
        >
          <IconDownload className="size-3.5" />
        </Button>
      </>
    ),
    [id, colSpan, filterConfig, savedChart, handleExport, exporting, t],
  );

  if (isInitialLoad || !filtersRestored) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="Total conversations open in the last 30 days"
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
        description="Total conversations open in the last 30 days"
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Content>
          <Alert variant="destructive">
            <Alert.Title>{t('error-loading-data')}</Alert.Title>
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
        <div
          className={isFetching ? 'opacity-50 pointer-events-none' : undefined}
        >
          <ConversationListTable conversationList={conversationList.list} />
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
  if (totalPages <= 1) return null;
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
        tableId="frontline_conversation_report_record_table"
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
    header: () => <RecordTable.ColumnSelector />,
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
