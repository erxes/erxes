import {
  IconCalendar,
  IconChartBar,
  IconCoins,
  IconCurrencyDollar,
  IconHash,
  IconLabelFilled,
  IconNote,
  IconRefresh,
  IconShoppingCart,
  IconStar,
  IconTag,
  IconTrophy,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef, Row } from '@tanstack/table-core';
import { useSetAtom } from 'jotai';
import {
  Badge,
  fixNum,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { IScoreLog, IScoreOwner } from '../types/score';
import { makeScoreMoreColumn } from './ScoreMoreColumn';
import { scoreDetailRecordAtom } from '../states/scoreDetail';

export const getOwnerName = (
  owner?: IScoreOwner,
  ownerType?: string,
): string => {
  if (!owner) return '';
  if (ownerType === 'user') {
    return (
      owner.details?.fullName ||
      [owner.details?.firstName, owner.details?.lastName]
        .filter(Boolean)
        .join(' ') ||
      ''
    );
  }
  if (ownerType === 'company') {
    return owner.primaryName || '';
  }
  return (
    [owner.firstName, owner.middleName, owner.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || ''
  );
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-CA');
};

const formatScore = (value?: number) => fixNum(value, 4).toLocaleString();

const ScoreOwnerNameCell = ({ row }: { row: Row<IScoreLog> }) => {
  const setDetailRecord = useSetAtom(scoreDetailRecordAtom);
  const record = row.original;
  const name = getOwnerName(record.owner, record.ownerType);

  return (
    <RecordTableInlineCell
      className={record.ownerId ? 'cursor-pointer' : undefined}
      onClick={() => {
        if (record.ownerId) setDetailRecord(record);
      }}
    >
      <TextOverflowTooltip value={name} />
    </RecordTableInlineCell>
  );
};

export const scoreLogColumns: ColumnDef<IScoreLog>[] = [
  makeScoreMoreColumn(),
  {
    id: 'ownerName',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Owner Name" />,
    size: 180,
    cell: ({ row }) => <ScoreOwnerNameCell row={row} />,
  },
  {
    id: 'ownerType',
    accessorKey: 'ownerType',
    header: () => (
      <RecordTable.InlineHead icon={IconLabelFilled} label="Owner Type" />
    ),
    size: 120,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="capitalize text-xs">
        {cell.getValue() as string}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'totalScore',
    accessorKey: 'totalScore',
    header: () => (
      <RecordTable.InlineHead icon={IconStar} label="Total Score" />
    ),
    size: 140,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="font-semibold">
        {fixNum(cell.getValue() as number)}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Date" />,
    size: 120,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={formatDate(cell.getValue() as string)} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'dealNumber',
    accessorFn: (row) => row.target?.number,
    header: () => (
      <RecordTable.InlineHead icon={IconHash} label="Deal Number" />
    ),
    size: 200,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'action',
    accessorKey: 'action',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Type" />,
    size: 90,
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
      else if (action === 'set') variant = 'outline';
      return (
        <RecordTableInlineCell>
          <Badge variant={variant as any}>{action}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyDollar} label="Amount" />
    ),
    size: 100,
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
  },
  {
    id: 'quantity',
    accessorKey: 'quantity',
    header: () => (
      <RecordTable.InlineHead icon={IconShoppingCart} label="Quantity" />
    ),
    size: 100,
    cell: ({ cell }) => {
      const val = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell className="text-right">
          <TextOverflowTooltip value={val == null ? '' : String(val)} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'pointsEarned',
    accessorFn: (row) => (row.action === 'add' ? row.change : undefined),
    header: () => (
      <RecordTable.InlineHead icon={IconCoins} label="Points Earned" />
    ),
    size: 130,
    cell: ({ cell }) => {
      const val = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell className="text-right font-semibold text-green-600">
          <TextOverflowTooltip value={formatScore(val)} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'pointsSpent',
    accessorFn: (row) => (row.action === 'subtract' ? row.change : undefined),
    header: () => (
      <RecordTable.InlineHead icon={IconChartBar} label="Points Spent" />
    ),
    size: 130,
    cell: ({ cell }) => {
      const val = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell className="text-right font-semibold text-red-500">
          <TextOverflowTooltip value={formatScore(val)} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'pointsRefunded',
    accessorFn: (row) => (row.action === 'refund' ? row.change : undefined),
    header: () => (
      <RecordTable.InlineHead icon={IconRefresh} label="Points Refunded" />
    ),
    size: 150,
    cell: ({ cell }) => {
      const val = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell className="text-right font-semibold text-blue-500">
          <TextOverflowTooltip value={formatScore(val)} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'pointsSet',
    accessorFn: (row) => (row.action === 'set' ? row.change : undefined),
    header: () => <RecordTable.InlineHead icon={IconCoins} label="Score Set" />,
    size: 120,
    cell: ({ cell }) => {
      const val = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell className="text-right font-semibold text-violet-600">
          <TextOverflowTooltip value={formatScore(val)} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'campaign',
    accessorFn: (row) => row.campaign?.title,
    header: () => <RecordTable.InlineHead icon={IconTrophy} label="Campaign" />,
    size: 140,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => (
      <RecordTable.InlineHead icon={IconNote} label="Description" />
    ),
    size: 160,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
  },
];

// Columns for the per-person detail sheet: the same definitions as the main
// list (so they stay in sync) minus the row actions and owner columns, which
// are redundant when every row already belongs to the same person.
const DETAIL_EXCLUDED_COLUMNS = new Set(['more', 'ownerName', 'ownerType']);

export const scoreDetailColumns: ColumnDef<IScoreLog>[] =
  scoreLogColumns.filter(
    (column) => !DETAIL_EXCLUDED_COLUMNS.has(column.id || ''),
  );
