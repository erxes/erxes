import { Cell, ColumnDef } from '@tanstack/react-table';
import { useConversationList } from '../hooks/useConversationList';
import { FrontlineCard } from './frontline-card/FrontlineCard';
import { GroupSelect } from './frontline-card/GroupSelect';
import { DateSelector } from './date-selector/DateSelector';
import { getFilters } from '../utils/dateFilters';
import {
  Alert,
  Badge,
  Button,
  RecordTable,
  RecordTableInlineCell,
  Skeleton,
  Table,
} from 'erxes-ui';
import { ConversationListItem } from '../types';
import { formatDate } from 'date-fns';
import { CustomersInline, MembersInline } from 'ui-modules';
import { memo, useState } from 'react';
import { IconMessageShare } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface FrontlineReportByListProps {
  title: string;
  colSpan?: 1 | 2;
  onColSpanChange?: (span: 1 | 2) => void;
}

export const FrontlineReportByList = ({
  title,
  colSpan = 2,
  onColSpanChange,
}: FrontlineReportByListProps) => {
  const id = title.toLowerCase().replace(/\s+/g, '-');
  const [dateValue, setDateValue] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [filters, setFilters] = useState(() => getFilters());

  const { conversationList, loading, error } = useConversationList({
    variables: {
      filters: {
        ...filters,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
      },
    },
  });

  const handleDateValueChange = (value: string) => {
    setDateValue(value);
    const newFilters = getFilters(value || undefined);
    setFilters(newFilters);
  };

  const handleSourceFilterChange = (value: string) => {
    setSourceFilter(value);
  };

  if (loading) return <Skeleton className="w-full h-48" />;

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
        <FrontlineCard.Header
          filter={
            <>
              <GroupSelect
                value={sourceFilter}
                onValueChange={handleSourceFilterChange}
              />
              <DateSelector
                value={dateValue}
                onValueChange={handleDateValueChange}
              />
            </>
          }
        />
        <FrontlineCard.Content>
          <FrontlineCard.Empty />
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  return (
    <FrontlineCard
      id={id}
      title={title}
      description="Total conversations open in the last 30 days"
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header
        filter={
          <>
            <GroupSelect
              value={sourceFilter}
              onValueChange={handleSourceFilterChange}
            />
            <DateSelector
              value={dateValue}
              onValueChange={handleDateValueChange}
            />
          </>
        }
      />
      <FrontlineCard.Content>
        <ConversationListTable conversationList={conversationList.list} />
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};

const ConversationListTable = memo(function ConversationListTable({
  conversationList,
}: {
  conversationList: ConversationListItem[];
}) {
  const navigate = useNavigate();
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

      <div className="flex justify-center">
        <Button
          variant="outline"
          size="icon"
          className="w-auto"
          onClick={() => {
            navigate('/frontline/inbox');
          }}
        >
          Go to conversations
        </Button>
      </div>
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
