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
import { ProductMoreColumnCell } from './ProductMoreColumn';
import { useTranslation } from 'react-i18next';

export const productColumns: (
  t: (key: string) => string,
) => ColumnDef<IProduct>[] = (t) => [
  {
    id: 'more',
    accessorKey: 'more',
    header: '',
    cell: ({ cell }: { cell: any }) => ProductMoreColumnCell({ cell }),
    size: 33,
  },
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
  },
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
    id: 'shortName',
    accessorKey: 'shortName',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('shortName')} />,
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
            value={`${cell.row.original?.category?.code || ''} - ${cell.row.original?.category?.name || ''
              }`}
          />
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
    id: 'oum',
    accessorKey: 'oum',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('oum')} />,
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
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
          <TextOverflowTooltip value={cell.row.original?.vendor?.primaryName} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'hasAttach',
    accessorKey: 'hasAttach',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label={t('hasAttach')} />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={Boolean(cell.row.original?.attachment?.url).toString()} />
        </RecordTableInlineCell>
      );
    },
  },
];
