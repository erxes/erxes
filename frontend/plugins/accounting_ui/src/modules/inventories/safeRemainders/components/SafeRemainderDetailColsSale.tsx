import { HeaderCell } from '@/check-synced/constants/HeaderCell';
import { Checkbox } from 'erxes-ui/components/checkbox';
import { IconMoneybag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  INumberFieldContainerProps,
  NumberField,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useSafeRemainderItemEdit } from '../hooks/useSafeRemainderItemEdit';
import { ISafeRemainderItem } from '../types/SafeRemainder';
import { getSafeRemainderCostDifference } from '../utils/safeRemainderTransactions';
import {
  SafeRemainderCountField,
  SafeRemainderDifferenceField,
  SafeRemainderNumberCell,
  SafeRemainderProductCell,
} from './SafeRemainderCells';
import { SafeRemainderUnitCostField } from './SafeRemainderUnitCostField';

const IsSaleField = ({
  value,
  remItem,
}: INumberFieldContainerProps & { remItem: ISafeRemainderItem }) => {
  const { editRemItem } = useSafeRemainderItemEdit();
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={value > 0}
        onCheckedChange={(value) =>
          editRemItem({
            variables: {
              ...remItem,
              trInfo: { ...remItem.trInfo, isSale: Number(value) > 0 },
            },
          })
        }
      />
    </div>
  );
};

const UnitPriceField = ({
  value,
  _id,
  remItem,
}: INumberFieldContainerProps & { remItem: ISafeRemainderItem }) => {
  const { editRemItem } = useSafeRemainderItemEdit();

  return (
    <NumberField
      value={value}
      scope={`remItem-${_id}-diff`}
      onSave={(value) => {
        editRemItem({
          variables: {
            ...remItem,
            trInfo: { ...remItem.trInfo, unitPrice: value },
          },
        });
      }}
      className={'shadow-none rounded-none px-2'}
    />
  );
};

const SalePriceField = ({
  value,
  _id,
  remItem,
}: INumberFieldContainerProps & { remItem: ISafeRemainderItem }) => {
  const { editRemItem } = useSafeRemainderItemEdit();

  return (
    <NumberField
      value={value}
      scope={`remItem-${_id}-diff`}
      onSave={(value) => {
        editRemItem({
          variables: {
            ...remItem,
            trInfo: {
              ...remItem.trInfo,
              unitPrice: value / (remItem.preCount - remItem.count || 1),
            },
          },
        });
      }}
      className={'shadow-none rounded-none px-2'}
    />
  );
};

export const safeRemDetailColumnsSale: ColumnDef<ISafeRemainderItem>[] = [
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
      <SafeRemainderNumberCell value={row.original.preCount ?? 0} />
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
    id: 'remainder',
    header: () => (
      <HeaderCell icon={IconMoneybag} labelKey="counted-quantity" />
    ),
    accessorKey: 'remainder',
    cell: ({ row }) => (
      <SafeRemainderCountField
        value={row.original.count ?? 0}
        field="count"
        _id={row.original._id}
        remItem={row.original}
      />
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
    id: 'isSale',
    accessorKey: 'isSale',
    header: () => (
      <HeaderCell icon={IconMoneybag} labelKey="record-as-a-sale" />
    ),
    size: 33,
    cell: ({ row }) => (
      <IsSaleField
        value={(row.original.trInfo?.isSale && 1) || 0}
        field="trInfo.status"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
  {
    id: 'unitPrice',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="unit-price" />,
    accessorKey: 'unitPrice',
    cell: ({ row }) => (
      <UnitPriceField
        value={row.original.trInfo?.unitPrice ?? 0}
        field="trInfo.unitPrice"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
  {
    id: 'salePrice',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="selling-price" />,
    accessorKey: 'salePrice',
    cell: ({ row }) => (
      <SalePriceField
        value={
          (row.original.trInfo?.unitPrice ?? 0) *
          (row.original.preCount - row.original.count)
        }
        field="salePrice"
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
      <SafeRemainderDifferenceField
        value={row.original.count - row.original.preCount}
        field="diff"
        _id={row.original._id}
        remItem={row.original}
      />
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
];
