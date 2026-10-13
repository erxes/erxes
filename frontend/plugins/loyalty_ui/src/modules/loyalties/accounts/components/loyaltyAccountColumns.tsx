import {
  IconCalendar,
  IconCoins,
  IconHash,
  IconLabelFilled,
  IconProgressCheck,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  fixNum,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { getOwnerName } from '../../scores/components/ScoreColumns';
import { ILoyaltyAccountType } from '../../settings/account-type/types';
import { ILoyaltyAccount } from '../types';
import { LoyaltyAccountMoreCell } from './LoyaltyAccountMoreCell';
import { LoyaltyAccountTierSelect } from './LoyaltyAccountTierSelect';

const STATUS_VARIANTS: Record<string, 'success' | 'destructive' | 'secondary'> =
  { active: 'success', frozen: 'destructive' };

// One column per account type: its balance and, when it has tiers, the tier.
const balanceColumn = (
  accountType: ILoyaltyAccountType,
): ColumnDef<ILoyaltyAccount> => ({
  id: `balance-${accountType._id}`,
  header: () => (
    <RecordTable.InlineHead icon={IconCoins} label={accountType.name} />
  ),
  size: 220,
  cell: ({ row }) => {
    const account = row.original;
    const balance = account.balances?.find(
      ({ accountTypeId }) => accountTypeId === accountType._id,
    );

    if (!balance) {
      return (
        <RecordTableInlineCell className="text-muted-foreground">
          —
        </RecordTableInlineCell>
      );
    }

    return (
      <RecordTableInlineCell className="gap-2">
        <span className="font-semibold">
          {fixNum(balance.balance || 0).toLocaleString()}
        </span>
        <LoyaltyAccountTierSelect
          accountId={account._id}
          balance={balance}
          disabled={account.status !== 'active'}
        />
      </RecordTableInlineCell>
    );
  },
});

export const loyaltyAccountColumns = (
  t: TFunction<'loyalty'>,
  accountTypes: ILoyaltyAccountType[],
): ColumnDef<ILoyaltyAccount>[] => [
  {
    id: 'more',
    size: 33,
    cell: ({ row }) => <LoyaltyAccountMoreCell account={row.original} />,
  },
  {
    id: 'ownerName',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label={t('owner-name')} />
    ),
    size: 200,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={
            getOwnerName(
              row.original.owner || undefined,
              row.original.ownerType,
            ) ||
            row.original.owner?.primaryEmail ||
            row.original.ownerId ||
            ''
          }
        />
      </RecordTableInlineCell>
    ),
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
    id: 'number',
    accessorKey: 'number',
    header: () => (
      <RecordTable.InlineHead
        icon={IconHash}
        label={t('loyalty-account-number')}
      />
    ),
    size: 140,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="font-mono">
        {cell.getValue() as string}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconProgressCheck} label={t('status')} />
    ),
    size: 120,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <Badge
          variant={STATUS_VARIANTS[row.original.status] || 'secondary'}
          title={row.original.frozenReason || undefined}
        >
          {t(`loyalty-account-status-${row.original.status}`)}
        </Badge>
      </RecordTableInlineCell>
    ),
  },
  ...accountTypes.map(balanceColumn),
  {
    id: 'joinedAt',
    accessorKey: 'joinedAt',
    header: () => (
      <RecordTable.InlineHead
        icon={IconCalendar}
        label={t('loyalty-account-joined')}
      />
    ),
    size: 130,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {cell.getValue()
          ? new Date(cell.getValue() as string).toLocaleDateString('en-CA')
          : ''}
      </RecordTableInlineCell>
    ),
  },
];
