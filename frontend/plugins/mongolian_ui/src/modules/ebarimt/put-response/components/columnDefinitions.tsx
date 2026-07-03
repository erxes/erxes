import {
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { TextOverflowTooltip, RecordTableInlineCell, RecordTable } from 'erxes-ui';
import type { TFunction } from 'i18next';

export const dateColumn = (t: TFunction): ColumnDef<unknown> => ({
  id: 'date',
  accessorKey: 'date',
  header: () => <RecordTable.InlineHead icon={IconHash} label={t('date')} />,
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    );
  },
});

export const counterColumn = (t: TFunction): ColumnDef<unknown> => ({
  id: 'values.counter',
  accessorKey: 'values.counter',
  header: () => <RecordTable.InlineHead icon={IconLabel} label={t('count')} />,
  cell: ({ row }) => {
    const counter = (row.original as any).values?.counter || 0;
    return (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(counter)} />
      </RecordTableInlineCell>
    );
  },
});

export const cityTaxColumn = (t: TFunction): ColumnDef<unknown> => ({
  id: 'values.cityTax',
  accessorKey: 'values.cityTax',
  header: () => <RecordTable.InlineHead icon={IconCurrencyDollar} label={t('city-tax')} />,
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    );
  },
});

export const vatColumn = (t: TFunction): ColumnDef<unknown> => ({
  id: 'values.vat',
  accessorKey: 'values.vat',
  header: () => <RecordTable.InlineHead icon={IconUser} label={t('vat')} />,
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    );
  },
});

export const amountColumn = (t: TFunction): ColumnDef<unknown> => ({
  id: 'values.amount',
  accessorKey: 'values.amount',
  header: () => <RecordTable.InlineHead icon={IconCategory} label={t('amount')} />,
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    );
  },
});
