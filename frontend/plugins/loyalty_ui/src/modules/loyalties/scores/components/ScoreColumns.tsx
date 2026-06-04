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
import type { ComponentType } from 'react';
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

  let name = '';
  if (ownerType === 'user') {
    name =
      owner.details?.fullName ||
      [owner.details?.firstName, owner.details?.lastName]
        .filter(Boolean)
        .join(' ');
  } else if (ownerType === 'company') {
    name = owner.primaryName || '';
  } else {
    name = [owner.firstName, owner.middleName, owner.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  if (name) return name;

  // Fall back to a contact identifier so owners without a name (e.g. customers
  // that only have an email/phone) are still recognizable — the dedicated
  // email/phone columns are no longer shown on the main list.
  return (
    owner.primaryEmail ||
    owner.email ||
    owner.primaryPhone ||
    owner.phone ||
    ''
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

// Shared between the main list (latest activity) and the detail sheet
// (per-transaction): a date and a colour-coded action/type badge.
const dateColumn: ColumnDef<IScoreLog> = {
  id: 'createdAt',
  accessorKey: 'createdAt',
  header: () => <RecordTable.InlineHead icon={IconCalendar} label="Date" />,
  size: 120,
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={formatDate(cell.getValue() as string)} />
    </RecordTableInlineCell>
  ),
};

const typeColumn: ColumnDef<IScoreLog> = {
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
};

// The "points earned / spent / refunded / set" detail columns differ only by
// which action they surface and their colour, so build them from one factory.
const makePointsColumn = ({
  id,
  action,
  label,
  icon,
  colorClass,
  size = 130,
}: {
  id: string;
  action: string;
  label: string;
  icon: ComponentType<any>;
  colorClass: string;
  size?: number;
}): ColumnDef<IScoreLog> => ({
  id,
  accessorFn: (row) => (row.action === action ? row.change : undefined),
  header: () => <RecordTable.InlineHead icon={icon} label={label} />,
  size,
  cell: ({ cell }) => (
    <RecordTableInlineCell
      className={`text-right font-semibold ${colorClass}`}
    >
      <TextOverflowTooltip
        value={formatScore(cell.getValue() as number | undefined)}
      />
    </RecordTableInlineCell>
  ),
});

// Main list columns: one row per owner — who they are, their net total score,
// and their most recent activity (date + type). The full per-transaction
// breakdown lives in the detail sheet — see `scoreDetailColumns`.
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
  dateColumn,
  typeColumn,
];

// Detail-sheet columns: the per-transaction breakdown for a single owner. The
// owner-identifying columns and the running total are omitted here because
// every row in the sheet already belongs to the same person.
export const scoreDetailColumns: ColumnDef<IScoreLog>[] = [
  dateColumn,
  {
    id: '_id',
    accessorKey: '_id',
    header: () => (
      <RecordTable.InlineHead icon={IconHash} label="Transaction ID" />
    ),
    size: 200,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
  },
  typeColumn,
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
  makePointsColumn({
    id: 'pointsEarned',
    action: 'add',
    label: 'Points Earned',
    icon: IconCoins,
    colorClass: 'text-green-600',
  }),
  makePointsColumn({
    id: 'pointsSpent',
    action: 'subtract',
    label: 'Points Spent',
    icon: IconChartBar,
    colorClass: 'text-red-500',
  }),
  makePointsColumn({
    id: 'pointsRefunded',
    action: 'refund',
    label: 'Points Refunded',
    icon: IconRefresh,
    colorClass: 'text-blue-500',
    size: 150,
  }),
  makePointsColumn({
    id: 'pointsSet',
    action: 'set',
    label: 'Score Set',
    icon: IconCoins,
    colorClass: 'text-violet-600',
    size: 120,
  }),
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
