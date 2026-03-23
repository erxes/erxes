import {
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
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
import { ProductNameCell } from './ProductNameCell';

export const productColumns: (
  t: (key: string) => string,
) => ColumnDef<IProduct>[] = (t) => [
  RecordTable.checkboxColumn as ColumnDef<IProduct>,
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
    size: 120,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('name')} />,
    cell: ({ cell }: { cell: any }) => <ProductNameCell cell={cell} />,
    size: 250,
  },
  {
    id: 'shortName',
    accessorKey: 'shortName',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label={t('shortName')} />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 180,
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label={t('category')} />
    ),
    cell: ({ cell }: { cell: any }) => {
      const code = cell.row.original?.category?.code;
      const name = cell.row.original?.category?.name;
      const value = [code, name].filter(Boolean).join(' - ') || '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value} />
        </RecordTableInlineCell>
      );
    },
    size: 300,
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
    size: 150,
  },
  {
    id: 'uom',
    accessorKey: 'uom',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('uom')} />,
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'remainder',
    accessorKey: 'remainder',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label={t('remainder')} />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={cell.row.original?.remainder?.remainder}
          />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
];
