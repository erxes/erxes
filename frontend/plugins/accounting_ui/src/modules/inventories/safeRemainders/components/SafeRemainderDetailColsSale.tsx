import type { TFunction } from 'i18next';
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

export const safeRemDetailColumnsSale = (
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
      <SafeRemainderNumberCell value={row.original.preCount ?? 0} />
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
    id: 'remainder',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('counted-balance')}
      />
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
    id: 'isSale',
    accessorKey: 'isSale',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('mark-for-sale')} />
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
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('unit-price')} />
    ),
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
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('selling-price')} />
    ),
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
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('quantity-difference')}
      />
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
];
