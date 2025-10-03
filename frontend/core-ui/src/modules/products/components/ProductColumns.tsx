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
export const productColumns: ColumnDef<IProduct>[] = [
  productMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IProduct>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
    cell: ({ cell }) => {
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
    header: () => <RecordTable.InlineHead icon={IconHash} label="Code" />,
    cell: ({ cell }) => {
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
      <RecordTable.InlineHead icon={IconCurrencyDollar} label="Unit Price" />
    ),
    cell: ({ cell }) => {
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
    header: () => <RecordTable.InlineHead icon={IconUser} label="Vendor" />,
    cell: ({ cell }) => {
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
      <RecordTable.InlineHead icon={IconCategory} label="Category" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={cell.row.original?.category?.name || ''}
          />
        </RecordTableInlineCell>
      );
    },
  },
];
