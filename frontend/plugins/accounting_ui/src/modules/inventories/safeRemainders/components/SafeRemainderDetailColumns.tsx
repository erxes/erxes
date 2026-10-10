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

export const safeRemDetailTableColumns: ColumnDef<ISafeRemainderItem>[] = [
  RecordTable.checkboxColumn as ColumnDef<ISafeRemainderItem>,
  {
    id: 'product',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Бараа" />,
    accessorKey: 'product',
    cell: ({ row }) => <SafeRemainderProductCell row={row} />,
    size: 300,
  },
  {
    id: 'uom',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Хэмжих нэгж" />
    ),
    accessorKey: 'uom',
    cell: ({ row }) => (
      <RecordTableInlineCell>{row.original.uom ?? ''}</RecordTableInlineCell>
    ),
  },
  {
    id: 'preCount',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Бүртгэлийн үлдэгдэл" />
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
        label="Бүртгэлийн нийт өртөг"
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
      <RecordTable.InlineHead icon={IconMoneybag} label="Тоолсон" />
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
            value={row.original.status ?? ''}
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
      <RecordTable.InlineHead icon={IconMoneybag} label="Тооллогын үлдэгдэл" />
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
        label="Тооллогын нийт өртөг"
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
      <RecordTable.InlineHead icon={IconMoneybag} label="Тооны зөрүү" />
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
      <RecordTable.InlineHead icon={IconMoneybag} label="Өртгийн зөрүү" />
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
      <RecordTable.InlineHead icon={IconMoneybag} label="Үүсэх гүйлгээ" />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {getSafeRemainderTransactionLabels(row.original).join(', ')}
      </RecordTableInlineCell>
    ),
    size: 220,
  },
];
