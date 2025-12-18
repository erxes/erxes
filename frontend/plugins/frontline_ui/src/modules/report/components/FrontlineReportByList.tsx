import { ColumnDef } from '@tanstack/react-table';
import { useConversationList } from '../hooks/useConversationList';
import { FrontlineCard } from './frontline-card/FrontlineCard';
import { GroupSelect } from './frontline-card/GroupSelect';
import { Badge, RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { ConversationListItem } from '../types';
import { formatDate } from 'date-fns';
import { CustomersInline, MembersInline } from 'ui-modules';

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
  const { conversationList, loading } = useConversationList({
    variables: {
      filters: {
        limit: 10,
      },
    },
  });
  return (
    <FrontlineCard
      id={id}
      title={title}
      description="Total conversations open in the last 30 days"
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header filter={<GroupSelect />} />
      <FrontlineCard.Content>
        <div className="bg-sidebar w-full rounded-lg">
          <RecordTable.Provider
            data={conversationList?.list || []}
            columns={columns}
            className="m-3"
          >
            <RecordTable.Scroll>
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  {loading ? (
                    <RecordTable.RowSkeleton rows={10} />
                  ) : (
                    <RecordTable.RowList />
                  )}
                </RecordTable.Body>
              </RecordTable>
            </RecordTable.Scroll>
          </RecordTable.Provider>
        </div>
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};

const columns: ColumnDef<ConversationListItem>[] = [
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
];
