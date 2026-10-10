import type { TFunction } from 'i18next';
import { Checkbox } from 'erxes-ui/components/checkbox';
import { IconMoneybag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  ITextFieldContainerProps,
  RecordTable,
  RecordTableHotKeyControl,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useSafeRemainderItemEdit } from '../hooks/useSafeRemainderItemEdit';
import { ISafeRemainderItem } from '../types/SafeRemainder';
import {
  getSafeRemainderCostDifference,
  getSafeRemainderTransactionLabels,
} from '../utils/safeRemainderTransactions';
import {
  SafeRemainderCountField,
  SafeRemainderDifferenceField,
  SafeRemainderNumberCell,
  SafeRemainderProductCell,
} from './SafeRemainderCells';
import { SafeRemainderUnitCostField } from './SafeRemainderUnitCostField';

const StatusField = ({
  value,
  remItem,
}: ITextFieldContainerProps & { remItem: ISafeRemainderItem }) => {
  const { editRemItem } = useSafeRemainderItemEdit();
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={value === 'checked'}
        onCheckedChange={(value) =>
          editRemItem({
            variables: { ...remItem, status: value ? 'checked' : 'new' },
          })
        }
      />
    </div>
  );
};

export const safeRemDetailTableColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<ISafeRemainderItem>[] => [
  RecordTable.checkboxColumn as ColumnDef<ISafeRemainderItem>,
  {
    id: 'product',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('inventory')} />
    ),
    accessorKey: 'product',
    cell: ({ row }) => <SafeRemainderProductCell row={row} />,
    size: 300,
  },
  {
    id: 'uom',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('unit-of-measure-label-2')}
      />
    ),
    accessorKey: 'uom',
    cell: ({ row }) => (
      <RecordTableInlineCell>{row.original.uom ?? ''}</RecordTableInlineCell>
    ),
  },
  {
    id: 'preCount',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('recorded-balance')}
      />
    ),
    accessorKey: 'preCount',
    cell: ({ row }) => (
      <SafeRemainderNumberCell value={row.original.preCount} />
    ),
  },
  {
    id: 'activeCost',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('recorded-total-cost')}
      />
    ),
    cell: ({ row }) => (
      <SafeRemainderNumberCell value={row.original.trInfo?.activeCost ?? 0} />
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('counted')} />
    ),
    size: 33,
    cell: ({ row }) => (
      <RecordTableHotKeyControl
        rowId={row.original._id}
        rowIndex={row.index}
        colIndex={0}
      >
        <div>
          <StatusField
            value={row.original.status}
            field="status"
            _id={row.original._id}
            remItem={row.original}
          />
        </div>
      </RecordTableHotKeyControl>
    ),
  },
  {
    id: 'remainder',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('counted-balance')}
      />
    ),
    accessorKey: 'remainder',
    cell: ({ row }) => (
      <RecordTableHotKeyControl
        rowId={row.original._id}
        rowIndex={row.index}
        colIndex={1}
      >
        <div>
          <SafeRemainderCountField
            value={row.original.count ?? 0}
            field="count"
            _id={row.original._id}
            remItem={row.original}
          />
        </div>
      </RecordTableHotKeyControl>
    ),
  },
  {
    id: 'unitCost',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('counted-total-cost')}
      />
    ),
    cell: ({ row }) => (
      <SafeRemainderUnitCostField
        value={
          row.original.trInfo?.unitCost ?? row.original.trInfo?.activeCost ?? 0
        }
        field="trInfo.unitCost"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
  {
    id: 'diff',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('quantity-difference')}
      />
    ),
    accessorKey: 'diff',
    cell: ({ row }) => (
      <RecordTableHotKeyControl
        rowId={row.original._id}
        rowIndex={row.index}
        colIndex={2}
      >
        <div>
          <SafeRemainderDifferenceField
            value={row.original.count - row.original.preCount}
            field="diff"
            _id={row.original._id}
            remItem={row.original}
          />
        </div>
      </RecordTableHotKeyControl>
    ),
  },
  {
    id: 'costDifference',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('cost-difference')}
      />
    ),
    cell: ({ row }) => (
      <SafeRemainderNumberCell
        value={getSafeRemainderCostDifference(row.original)}
      />
    ),
  },
  {
    id: 'transactions',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('generated-transaction')}
      />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {getSafeRemainderTransactionLabels(row.original)
          .map((label) => t(label))
          .join(', ')}
      </RecordTableInlineCell>
    ),
    size: 220,
  },
];
