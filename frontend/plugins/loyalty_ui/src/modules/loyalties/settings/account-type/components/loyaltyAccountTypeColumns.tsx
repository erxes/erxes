import {
  IconCircleCheck,
  IconListNumbers,
  IconRefresh,
  IconStairs,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import {
  activeTiers,
  ILoyaltyAccountType,
  LOYALTY_ACCOUNT_TYPE_OWNER_TYPES,
} from '../types';
import { loyaltyAccountTypeMoreColumn } from './LoyaltyAccountTypeMoreColumn';

const ownerTypeLabel = (ownerType: string) =>
  LOYALTY_ACCOUNT_TYPE_OWNER_TYPES.find(({ value }) => value === ownerType)
    ?.label || ownerType;

export const loyaltyAccountTypeColumns = (
  t: TFunction<'loyalty'>,
): ColumnDef<ILoyaltyAccountType>[] => [
  loyaltyAccountTypeMoreColumn,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconTag} label={t('name')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 220,
  },
  {
    id: 'ownerType',
    accessorKey: 'ownerType',
    header: () => (
      <RecordTable.InlineHead icon={IconUsers} label={t('apply-score-to')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={t(ownerTypeLabel(cell.getValue() as string))}
        />
      </RecordTableInlineCell>
    ),
    size: 160,
  },
  {
    id: 'tiers',
    accessorKey: 'tiers',
    header: () => (
      <RecordTable.InlineHead icon={IconStairs} label={t('loyalty-tiers')} />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={
            activeTiers(row.original.tiers)
              .map(({ name }) => name)
              .join(' → ') || '-'
          }
        />
      </RecordTableInlineCell>
    ),
    size: 220,
  },
  {
    id: 'expiry',
    accessorKey: 'expiry',
    header: () => (
      <RecordTable.InlineHead icon={IconRefresh} label={t('loyalty-expiry')} />
    ),
    cell: ({ row }) => {
      const { expiry, reset } = row.original;
      const value =
        expiry?.mode === 'rolling'
          ? t('loyalty-expiry-after-months', { count: expiry.months ?? 0 })
          : expiry?.mode === 'calendar'
          ? t(`loyalty-reset-period-${reset?.period || 'never'}`)
          : t('loyalty-expiry-none');

      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value} />
        </RecordTableInlineCell>
      );
    },
    size: 140,
  },
  {
    id: 'campaignCount',
    accessorKey: 'campaignCount',
    header: () => (
      <RecordTable.InlineHead icon={IconListNumbers} label={t('campaigns')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={`${cell.getValue() ?? 0}`} />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconCircleCheck} label={t('status')} />
    ),
    cell: ({ cell }) => {
      const isActive = cell.getValue() === 'active';

      return (
        <RecordTableInlineCell>
          <Badge variant={isActive ? 'success' : 'secondary'}>
            {t(isActive ? 'active' : 'archived')}
          </Badge>
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
];
