import { IconHash, IconCode, IconCircleCheck } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { ProductItem } from '../types/productItem';
import { HeaderCell } from '../../components/HeaderCell';

const StatusProductCell = ({ item }: { item: ProductItem }) => {
  const { t } = useTranslation('mongolian');
  const isSynced = item.isSynced;

  return (
    <RecordTableInlineCell>
      {isSynced ? (
        <span className="text-green-600 font-medium">{t('synced')}</span>
      ) : (
        <span className="text-gray-400"></span>
      )}
    </RecordTableInlineCell>
  );
};

export const checkProductColumns: ColumnDef<ProductItem>[] = [
  RecordTable.checkboxColumn as ColumnDef<ProductItem>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <HeaderCell icon={IconCode} label="code" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <HeaderCell icon={IconHash} label="name" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'barcodes',
    accessorKey: 'barcodes',
    header: () => <HeaderCell icon={IconHash} label="bar-codes" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'unit_price',
    accessorKey: 'unit_price',
    header: () => <HeaderCell icon={IconHash} label="unit-price" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'isSynced',
    header: () => <HeaderCell icon={IconCircleCheck} label="status" />,
    cell: ({ row }) => <StatusProductCell item={row.original} />,
  },
];
