import {
  IconCalendarPlus,
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
  IconRefresh,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import {
  CheckSyncedDealStatus,
  ICheckSyncedDeals,
} from '../types/checkSyncedDeals';
import { toSyncDealIdsAtom } from '../hooks/useCheckSyncedDeals';
import { HeaderCell } from '../../components/HeaderCell';
import {
  ToSyncHeaderCell,
  ToSyncCell,
} from '../../shared/components/ToSyncColumnComponents';
import { syncedInfoColumn } from '../../shared/components/SyncedInfoColumns';

const syncableStatuses = new Set<CheckSyncedDealStatus>([
  'checked',
  'synced',
  'pending',
  'error',
  'resynced',
]);

const getSyncStatus = (deal: ICheckSyncedDeals): CheckSyncedDealStatus =>
  deal.syncStatus || 'skipped';

export const isSyncableDeal = (deal: ICheckSyncedDeals) =>
  syncableStatuses.has(getSyncStatus(deal));

const stringifyAmount = (amount: unknown) => {
  if (amount == null) {
    return '';
  }

  if (typeof amount === 'string') {
    return amount;
  }

  return JSON.stringify(amount);
};

export const checkSyncedDealsColumns: ColumnDef<ICheckSyncedDeals>[] = [
  RecordTable.checkboxColumn as ColumnDef<ICheckSyncedDeals>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <HeaderCell icon={IconLabel} label="deal-name" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <HeaderCell icon={IconHash} label="deal-number" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: () => <HeaderCell icon={IconCurrencyDollar} label="amount" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={stringifyAmount(cell.getValue())} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <HeaderCell icon={IconCalendarPlus} label="created-at" />,
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'modifiedAt',
    accessorKey: 'modifiedAt',
    header: () => <HeaderCell icon={IconCategory} label="modified-at" />,
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'stageChangedDate',
    accessorKey: 'stageChangedDate',
    header: () => <HeaderCell icon={IconCategory} label="stage-changed-date" />,
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'unSynced',
    accessorKey: 'syncStatus',
    header: () => <HeaderCell icon={IconCategory} label="sync-status" />,
    cell: ({ cell }) => {
      const status = (cell.getValue() || 'skipped') as string;

      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={status} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'toSync',
    accessorKey: 'toSync',
    header: () => (
      <ToSyncHeaderCell
        toSyncIdsAtom={toSyncDealIdsAtom}
        isSyncable={isSyncableDeal}
        ariaLabel="select-all-deals-to-sync"
      />
    ),
    size: 33,
    cell: ({ row }) => (
      <ToSyncCell
        toSyncIdsAtom={toSyncDealIdsAtom}
        isSyncable={isSyncableDeal}
        item={row.original}
        ariaLabel="select-deal-to-sync"
      />
    ),
  },
  syncedInfoColumn('syncedDate', 'synced-date'),
  syncedInfoColumn('syncedBillNumber', 'synced-bill-number'),
  syncedInfoColumn('syncedCustomer', 'synced-customer'),
  {
    id: 'syncAction',
    accessorKey: 'syncAction',
    header: () => <HeaderCell icon={IconRefresh} label="sync-action" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
