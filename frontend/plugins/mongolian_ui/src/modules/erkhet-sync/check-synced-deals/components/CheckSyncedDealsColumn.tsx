import { IconCalendarPlus, IconCategory, IconCurrencyDollar, IconHash, IconLabel, IconRefresh } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Checkbox,
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

import { CheckSyncedDealStatus, ICheckSyncedDeals } from '../types/checkSyncedDeals';
import { useCheckSyncedDeals, toSyncDealIdsAtom } from '../hooks/useCheckSyncedDeals';
import { HeaderCell } from '../../components/HeaderCell';

const ToSyncDealHeader = () => {
  const { t } = useTranslation('mongolian');
  const [toSyncDealIds] = useAtom(toSyncDealIdsAtom);
  const { Deals, setAllDealsToSync } = useCheckSyncedDeals();
  const syncableDealIds = (Deals || []).filter(isSyncableDeal).map((d) => d._id);
  const selectedCount = syncableDealIds.filter((id) => toSyncDealIds[id]).length;
  const isAllSelected = syncableDealIds.length > 0 && selectedCount === syncableDealIds.length;
  const isSomeSelected = selectedCount > 0 && !isAllSelected;
  const nextChecked = !(isAllSelected || isSomeSelected);

  return (
    <div className="relative z-20 flex items-center justify-center h-8">
      <Checkbox
        key={`${syncableDealIds.length}-${selectedCount}`}
        checked={isAllSelected || (isSomeSelected && 'indeterminate')}
        disabled={!syncableDealIds.length}
        onCheckedChange={() => setAllDealsToSync(syncableDealIds, nextChecked)}
        aria-label={t('select-all-deals-to-sync')}
      />
    </div>
  );
};

const ToSyncDealCell = ({ deal }: { deal: ICheckSyncedDeals }) => {
  const { t } = useTranslation('mongolian');
  const [toSyncDealIds] = useAtom(toSyncDealIdsAtom);
  const { setDealToSync } = useCheckSyncedDeals();
  const disabled = !isSyncableDeal(deal);

  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={!disabled && Boolean(toSyncDealIds[deal._id])}
        disabled={disabled}
        onCheckedChange={(value) => setDealToSync(deal._id, Boolean(value))}
        aria-label={t('select-deal-to-sync')}
      />
    </div>
  );
};

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
  if (!amount) {
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
    header: () => <ToSyncDealHeader />,
    size: 33,
    cell: ({ row }) => <ToSyncDealCell deal={row.original} />,
  },
  {
    id: 'syncedDate',
    accessorKey: 'syncedDate',
    header: () => <HeaderCell icon={IconCategory} label="synced-date" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'syncedBillNumber',
    accessorKey: 'syncedBillNumber',
    header: () => <HeaderCell icon={IconCategory} label="synced-bill-number" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'syncedCustomer',
    accessorKey: 'syncedCustomer',
    header: () => <HeaderCell icon={IconCategory} label="synced-customer" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
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
