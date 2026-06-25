import { IconHash, IconCode, IconCircleCheck } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { CheckProductMoreColumn } from './CheckProductMoreColumn';
import { ProductItem } from '../types/productItem';

export const checkProductColumns: ColumnDef<ProductItem>[] = [
  CheckProductMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ProductItem>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead label={t('code')} icon={IconCode} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconHash} label={t('name')} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead label={t('bar-codes')} icon={IconHash} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead label={t('unit-price')} icon={IconHash} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead label={t('status')} icon={IconCircleCheck} />;
    },
    cell: ({ row }) => {
      const { t } = useTranslation('mongolian');
      const isSynced = row.original.isSynced;

      return (
        <RecordTableInlineCell>
          {isSynced ? (
            <span className="text-green-600 font-medium">{t('synced')}</span>
          ) : (
            <span className="text-gray-400"></span>
          )}
        </RecordTableInlineCell>
      );
    },
  },
];
