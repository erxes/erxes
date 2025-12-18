import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { FrontlineCard } from './frontline-card/FrontlineCard';
import { GroupSelect } from './frontline-card/GroupSelect';
import { useConversationTags } from '../hooks/useConversationTags';
import { ColumnDef } from '@tanstack/react-table';

interface FrontlineReportByTagProps {
  title: string;
  colSpan?: 1 | 2;
  onColSpanChange?: (span: 1 | 2) => void;
}

export const FrontlineReportByTag = ({
  title,
  colSpan = 2,
  onColSpanChange,
}: FrontlineReportByTagProps) => {
  const id = title.toLowerCase().replace(/\s+/g, '-');
  const { conversationTags, loading } = useConversationTags({
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
        <div className="bg-sidebar w-full rounded-lg [&_th]:last-of-type:text-right">
          <RecordTable.Provider
            data={conversationTags || []}
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

const columns: ColumnDef<{
  _id: string;
  name: string;
  count: number;
  percentage: number;
}>[] = [
  {
    id: 'name',
    header: 'Tag',
    accessorKey: 'name',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="px-4 text-xs">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'count',
    header: 'Data',
    accessorKey: 'count',
    size: 10,
    cell: ({ cell }) => {
      const { count, percentage } = cell.row.original || {};
      return (
        <RecordTableInlineCell className="px-4 text-xs flex items-center justify-end text-muted-foreground">
          {count} / {percentage}%
        </RecordTableInlineCell>
      );
    },
  },
];
