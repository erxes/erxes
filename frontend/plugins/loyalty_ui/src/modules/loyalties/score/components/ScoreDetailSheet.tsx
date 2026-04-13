import {
  IconCalendar,
  IconChartBar,
  IconCoins,
  IconCurrencyDollar,
  IconHash,
  IconNote,
  IconRefresh,
  IconShoppingCart,
  IconTag,
  IconTrophy,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  Sheet,
  TextOverflowTooltip,
} from 'erxes-ui';
import { IScoreLog, IScoreLogItem } from '../types/score';

interface ScoreDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: IScoreLog | null;
}

const getOwnerName = (record: IScoreLog | null): string => {
  const owner = record?.owner;
  const ownerType = record?.ownerType;
  if (!owner) return '—';
  if (ownerType === 'user') {
    return (
      owner.details?.fullName ||
      [owner.details?.firstName, owner.details?.lastName]
        .filter(Boolean)
        .join(' ') ||
      '—'
    );
  }
  if (ownerType === 'company') return owner.primaryName || '—';
  return (
    [owner.firstName, owner.middleName, owner.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || '—'
  );
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-CA');
};

const logColumns: ColumnDef<IScoreLogItem>[] = [
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Date" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={formatDate(cell.getValue() as string)} />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: '_id',
    accessorKey: '_id',
    header: () => (
      <RecordTable.InlineHead icon={IconHash} label="Transaction ID" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'action',
    accessorKey: 'action',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Type" />,
    cell: ({ cell }) => {
      const action = cell.getValue() as string | undefined;
      if (!action)
        return (
          <RecordTableInlineCell>
            <span className="text-muted-foreground"></span>
          </RecordTableInlineCell>
        );
      let variant = 'secondary';
      if (action === 'add') variant = 'success';
      else if (action === 'subtract') variant = 'destructive';
      return (
        <RecordTableInlineCell>
          <Badge variant={variant as any}>{action}</Badge>
        </RecordTableInlineCell>
      );
    },
    size: 70,
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyDollar} label="Amount" />
    ),
    cell: ({ cell }) => {
      const val = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell className="text-right">
          <TextOverflowTooltip
            value={val == null ? '' : val.toLocaleString()}
          />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'quantity',
    accessorKey: 'quantity',
    header: () => (
      <RecordTable.InlineHead icon={IconShoppingCart} label="Quantity" />
    ),
    cell: ({ cell }) => {
      const val = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell className="text-right">
          <TextOverflowTooltip value={val == null ? '' : String(val)} />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'pointsEarned',
    accessorFn: (row) => (row.action === 'add' ? row.change : undefined),
    header: () => (
      <RecordTable.InlineHead icon={IconCoins} label="Points Earned" />
    ),
    cell: ({ cell }) => {
      const val = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell className="text-right font-semibold text-green-600">
          <TextOverflowTooltip value={val == null ? '' : String(val)} />
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
  {
    id: 'pointsSpent',
    accessorFn: (row) => (row.action === 'subtract' ? row.change : undefined),
    header: () => (
      <RecordTable.InlineHead icon={IconChartBar} label="Points Spent" />
    ),
    cell: ({ cell }) => {
      const val = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell className="text-right font-semibold text-red-500">
          <TextOverflowTooltip value={val == null ? '' : String(val)} />
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
  {
    id: 'pointsRefunded',
    accessorFn: (row) => (row.action === 'refund' ? row.change : undefined),
    header: () => (
      <RecordTable.InlineHead icon={IconRefresh} label="Points Refunded" />
    ),
    cell: ({ cell }) => {
      const val = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell className="text-right font-semibold text-blue-500">
          <TextOverflowTooltip value={val == null ? '' : String(val)} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'campaign',
    accessorFn: (row) => row.campaign?.title,
    header: () => <RecordTable.InlineHead icon={IconTrophy} label="Campaign" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 140,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => (
      <RecordTable.InlineHead icon={IconNote} label="Description" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 160,
  },
];

export const ScoreDetailSheet = ({
  open,
  onOpenChange,
  record,
}: ScoreDetailSheetProps) => {
  const ownerName = getOwnerName(record);
  const logs = record?.logs || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View className="sm:max-w-8xl p-0">
        <Sheet.Header className="border-b px-6 py-8 gap-3">
          <div>
            <Sheet.Title>{ownerName}</Sheet.Title>
            <p className="text-xs text-muted-foreground mt-2 capitalize">
              {record?.ownerType || ''} · Total score:{' '}
              <span className="font-semibold text-foreground">
                {record?.totalScore ?? 0}
              </span>
            </p>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="p-4 overflow-auto">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
              No log records found
            </div>
          ) : (
            <div className="rounded-md overflow-hidden">
              <RecordTable.Provider
                columns={logColumns}
                data={logs}
                className="w-full"
              >
                <RecordTable>
                  <RecordTable.Header />
                  <RecordTable.Body>
                    <RecordTable.RowList />
                  </RecordTable.Body>
                </RecordTable>
              </RecordTable.Provider>
            </div>
          )}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
