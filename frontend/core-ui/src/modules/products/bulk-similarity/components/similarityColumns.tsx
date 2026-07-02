import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { IconStarFilled } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import { IProductSimilarity } from '../types';

export const createSimilarityColumns = (
  t: TFunction,
): ColumnDef<IProductSimilarity>[] => [
  RecordTable.checkboxColumn as ColumnDef<IProductSimilarity>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label={t('name', 'Name')} />,
    cell: ({ row }) => {
      const [, setEditId] = useQueryState<string>('similarityId');
      return (
        <RecordTableInlineCell>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setEditId(row.original._id);
              }}
            >
              {row.original.info?.name || t('untitled', 'Untitled')}
            </Badge>
            {row.original.starProductId && (
              <IconStarFilled
                size={13}
                className="text-warning shrink-0"
                aria-label={t('has-star-product', 'Has a star product')}
              />
            )}
          </div>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'code',
    accessorKey: 'info.code',
    header: () => <RecordTable.InlineHead label={t('code', 'Code')} />,
    size: 120,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.info?.code || '—'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label={t('status', 'Status')} />,
    size: 110,
    cell: ({ row }) => {
      const status = row.original.status || 'active';
      return (
        <RecordTableInlineCell>
          <Badge variant={status === 'active' ? 'success' : 'secondary'}>
            {status}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'type',
    accessorKey: 'info.type',
    header: () => <RecordTable.InlineHead label={t('type', 'Type')} />,
    size: 110,
    cell: ({ row }) => (
      <RecordTableInlineCell className="capitalize">
        {row.original.info?.type || '—'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'uom',
    accessorKey: 'info.uom',
    header: () => <RecordTable.InlineHead label={t('uom', 'UOM')} />,
    size: 100,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={row.original.info?.uom || '—'} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'unitPrice',
    accessorKey: 'info.unitPrice',
    header: () => <RecordTable.InlineHead label={t('unit-price', 'Unit price')} />,
    size: 130,
    cell: ({ row }) => {
      const { unitPrice, currency } = row.original.info || {};
      return (
        <RecordTableInlineCell className="tabular-nums">
          {unitPrice != null
            ? `${unitPrice.toLocaleString()}${currency ? ` ${currency}` : ''}`
            : '—'}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'products',
    header: () => <RecordTable.InlineHead label={t('products', 'Products')} />,
    size: 110,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <Badge variant="secondary">
          {row.original.productIds?.length || 0}
        </Badge>
      </RecordTableInlineCell>
    ),
  },
];
