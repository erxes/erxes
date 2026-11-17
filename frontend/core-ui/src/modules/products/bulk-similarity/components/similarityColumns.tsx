import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { IconStarFilled } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import { SIMILARITY_CONTENT_TYPE } from '../constants/similarityContentType';
import { IProductSimilarity } from '../types';

const SimilarityNameCell = ({
  similarity,
}: {
  similarity: IProductSimilarity;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { openRecord } = useSidePanel();

  return (
    <RecordTableInlineCell>
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            openRecord({
              contentType: SIMILARITY_CONTENT_TYPE,
              contentId: similarity._id,
            });
          }}
        >
          {similarity.info?.name || t('untitled', 'Untitled')}
        </Badge>
        {similarity.starProductId && (
          <IconStarFilled
            size={13}
            className="text-warning shrink-0"
            aria-label={t('has-star-product', 'Has a star product')}
          />
        )}
      </div>
    </RecordTableInlineCell>
  );
};

export const createSimilarityColumns = (
  t: TFunction,
): ColumnDef<IProductSimilarity>[] => [
  RecordTable.checkboxColumn as ColumnDef<IProductSimilarity>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label={t('name', 'Name')} />,
    cell: ({ row }) => <SimilarityNameCell similarity={row.original} />,
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
