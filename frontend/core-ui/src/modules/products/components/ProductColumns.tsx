import {
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  CurrencyFormatedDisplay,
  CurrencyCode,
} from 'erxes-ui';
import { IProduct } from 'ui-modules';
import { productMoreColumn } from './ProductMoreColumn';
import { useTranslation } from 'react-i18next';

export const productColumns: (
  t: (key: string) => string,
) => ColumnDef<IProduct>[] = (t) => [
  productMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IProduct>,

  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('name')} />,
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label={t('code')} />,
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'unitPrice',
    accessorKey: 'unitPrice',
    header: () => (
      <RecordTable.InlineHead
        icon={IconCurrencyDollar}
        label={t('unit-price')}
      />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <CurrencyFormatedDisplay
            currencyValue={{
              amountMicros: cell.getValue() as number,
              currencyCode: CurrencyCode.MNT,
            }}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'vendor',
    accessorKey: 'vendor',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label={t('vendor')} />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label={t('category')} />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={`${cell.row.original?.category?.code || ''} - ${
              cell.row.original?.category?.name || ''
            }`}
          />
        </RecordTableInlineCell>
      );
    },
  },
];
