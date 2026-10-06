import { useTranslation } from 'react-i18next';
import { HeaderCell } from '@/check-synced/constants/HeaderCell';
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

const TransactionLabelsCell = ({ item }: { item: ISafeRemainderItem }) => {
  const { t } = useTranslation('accounting');
  return (
    <RecordTableInlineCell>
      {getSafeRemainderTransactionLabels(item)
        .map((label) => t(label))
        .join(', ')}
    </RecordTableInlineCell>
  );
};

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

export const safeRemDetailTableColumns: ColumnDef<ISafeRemainderItem>[] = [
  RecordTable.checkboxColumn as ColumnDef<ISafeRemainderItem>,
  {
    id: 'product',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="inventory" />,
    accessorKey: 'product',
    cell: ({ row }) => <SafeRemainderProductCell row={row} />,
    size: 300,
  },
  {
    id: 'uom',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="unit-of-measure" />,
    accessorKey: 'uom',
    cell: ({ row }) => (
      <RecordTableInlineCell>{row.original.uom ?? ''}</RecordTableInlineCell>
    ),
  },
  {
    id: 'preCount',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="book-quantity" />,
    accessorKey: 'preCount',
    cell: ({ row }) => (
      <SafeRemainderNumberCell value={row.original.preCount} />
    ),
  },
  {
    id: 'activeCost',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="book-value" />,
    cell: ({ row }) => (
      <SafeRemainderNumberCell value={row.original.trInfo?.activeCost ?? 0} />
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="counted" />,
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
      <HeaderCell icon={IconMoneybag} labelKey="counted-quantity" />
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
      <HeaderCell icon={IconMoneybag} labelKey="counted-inventory-value" />
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
      <HeaderCell icon={IconMoneybag} labelKey="quantity-variance" />
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
    header: () => <HeaderCell icon={IconMoneybag} labelKey="cost-variance" />,
    cell: ({ row }) => (
      <SafeRemainderNumberCell
        value={getSafeRemainderCostDifference(row.original)}
      />
    ),
  },
  {
    id: 'transactions',
    header: () => (
      <HeaderCell icon={IconMoneybag} labelKey="transactions-to-generate" />
    ),
    cell: ({ row }) => <TransactionLabelsCell item={row.original} />,
    size: 220,
  },
];
