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
import { IProduct, TagsSelect } from 'ui-modules';
import { ProductNameCell } from './ProductNameCell';
import { productMoreColumn } from './ProductMoreCell';

export const productColumns: (
  t: (key: string) => string,
) => ColumnDef<IProduct>[] = (t) => [
  productMoreColumn,
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
    size: 150,
  },
  {
    id: 'hasAttach',
    accessorKey: 'hasAttach',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label={t('hasAttach')} />
    ),
    cell: ({ cell }: { cell: any }) => {
      const hasAttachment = Boolean(cell.row.original?.attachment?.url);
      const value = hasAttachment ? 'Attached' : 'None';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value} />
        </RecordTableInlineCell>
      );
    },
    size: 100,
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
    size: 200,
  },
  {
    id: 'tags',
    accessorKey: 'tags',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('tags')} />,
    cell: ({ cell }: { cell: any }) => {
      return (
        <TagsSelect.InlineCell
          type="core:product"
          mode="multiple"
          value={cell.row.original.tagIds}
          targetIds={[cell.row.original._id]}
          options={(newSelectedTagIds) => ({
            update: (cache) => {
              cache.modify({
                id: cache.identify({
                  __typename: 'Product',
                  _id: cell.row.original._id,
                }),
                fields: {
                  tagIds: () => newSelectedTagIds,
                },
                optimistic: true,
              });
            },
          })}
        />
      );
    },
    size: 200,
  },
];
