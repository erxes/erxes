import {
  IconCalendar,
  IconChartBar,
  IconCoins,
  IconHash,
  IconHourglass,
  IconListDetails,
  IconLabelFilled,
  IconNote,
  IconRefresh,
  IconStar,
  IconTag,
  IconTrophy,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef, Row } from '@tanstack/table-core';
import { TFunction } from 'i18next';
import { useSetAtom } from 'jotai';
import {
  Badge,
  Button,
  fixNum,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { IScoreLog, IScoreOwner } from '../types/score';
import { EarnCalcPopover } from './EarnCalcPopover';
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

const ACTION_VARIANTS: Record<
  string,
  'secondary' | 'success' | 'destructive' | 'warning'
> = {
  add: 'success',
  subtract: 'destructive',
  expire: 'warning',
};

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

export const scoreLogColumns = (
  t: TFunction<'loyalty'>,
): ColumnDef<IScoreLog>[] => [
  makeScoreMoreColumn(),
  {
    id: 'ownerName',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label={t('owner-name')} />
    ),
    size: 180,
    cell: ({ row }) => <ScoreOwnerNameCell row={row} />,
  },
  {
    id: 'ownerType',
    accessorKey: 'ownerType',
    header: () => (
      <RecordTable.InlineHead icon={IconLabelFilled} label={t('owner-type')} />
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
      <RecordTable.InlineHead icon={IconStar} label={t('total-score')} />
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
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label={t('date')} />
    ),
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
      <RecordTable.InlineHead icon={IconHash} label={t('number')} />
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
    header: () => <RecordTable.InlineHead icon={IconTag} label={t('type')} />,
    size: 90,
    cell: ({ cell }) => {
      const action = cell.getValue() as string | undefined;
      if (!action)
        return (
          <RecordTableInlineCell>
            <span className="text-muted-foreground"></span>
          </RecordTableInlineCell>
        );
      const variant = ACTION_VARIANTS[action] || 'secondary';
      return (
        <RecordTableInlineCell>
          <Badge variant={variant}>{t(`score-action-${action}`)}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'pointsEarned',
    accessorFn: (row) => (row.action === 'add' ? row.change : undefined),
    header: () => (
      <RecordTable.InlineHead icon={IconCoins} label={t('points-earned')} />
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
      <RecordTable.InlineHead icon={IconChartBar} label={t('points-spent')} />
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
      <RecordTable.InlineHead icon={IconRefresh} label={t('points-refunded')} />
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
    header: () => (
      <RecordTable.InlineHead icon={IconCoins} label={t('score-set')} />
    ),
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
    id: 'pointsExpired',
    accessorFn: (row) => (row.action === 'expire' ? row.change : undefined),
    header: () => (
      <RecordTable.InlineHead
        icon={IconHourglass}
        label={t('points-expired')}
      />
    ),
    size: 130,
    cell: ({ cell }) => {
      const val = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell className="text-right font-semibold text-muted-foreground">
          <TextOverflowTooltip value={formatScore(val)} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'breakdown',
    accessorFn: (row) =>
      (row.breakdown || [])
        .map(({ name, points }) => `${name} ${formatScore(points)}`)
        .join(' · '),
    header: () => (
      <RecordTable.InlineHead
        icon={IconListDetails}
        label={t('score-breakdown')}
      />
    ),
    size: 220,
    cell: ({ cell, row }) => {
      const { breakdown, change } = row.original;
      const text = (cell.getValue() as string) || '';

      if (!breakdown?.length) {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={text} />
          </RecordTableInlineCell>
        );
      }

      return (
        <EarnCalcPopover breakdown={breakdown} total={change || 0}>
          <Button
            variant="ghost"
            className="h-full w-full min-w-0 justify-start rounded-none px-2 font-normal"
          >
            <span className="truncate underline decoration-dotted underline-offset-4">
              {text}
            </span>
          </Button>
        </EarnCalcPopover>
      );
    },
  },
  {
    id: 'campaign',
    accessorFn: (row) => row.campaign?.title,
    header: () => (
      <RecordTable.InlineHead icon={IconTrophy} label={t('campaign')} />
    ),
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
      <RecordTable.InlineHead icon={IconNote} label={t('description')} />
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

export const scoreDetailColumns = (
  t: TFunction<'loyalty'>,
): ColumnDef<IScoreLog>[] =>
  scoreLogColumns(t).filter(
    (column) => !DETAIL_EXCLUDED_COLUMNS.has(column.id || ''),
  );
