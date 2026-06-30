import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { IProductRule } from './types';
import { productRuleNameColumn } from './ProductRuleNameColumn';
import { productRuleMoreColumn } from './ProductRuleMoreColumn';

export const productRuleColumns = (
  t: (key: string) => string,
): ColumnDef<IProductRule>[] => [
  productRuleMoreColumn,
  productRuleNameColumn,
  RecordTable.checkboxColumn as ColumnDef<IProductRule>,
  {
    id: 'unitPrice',
    accessorKey: 'unitPrice',
    header: () => <RecordTable.InlineHead label={t('unit-price')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={(cell.getValue() as number)?.toString() || '-'}
        />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'categories',
    accessorKey: 'categories',
    header: () => <RecordTable.InlineHead label={t('categories')} />,
    cell: ({ cell }) => {
      const categories = (cell.getValue() as any[]) || [];
      return (
        <RecordTableInlineCell>
          {categories.map((c) => (
            <Badge variant="secondary" className="cursor-pointer" key={c._id}>
              {c.name}
            </Badge>
          ))}
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    id: 'excludeCategories',
    accessorKey: 'excludeCategories',
    header: () => <RecordTable.InlineHead label={t('exclude-categories')} />,
    cell: ({ cell }) => {
      const excludeCategories = (cell.getValue() as any[]) || [];
      return (
        <RecordTableInlineCell>
          {excludeCategories.map((c) => (
            <Badge variant="secondary" className="cursor-pointer" key={c._id}>
              {c.name}
            </Badge>
          ))}
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    id: 'products',
    accessorKey: 'products',
    header: () => <RecordTable.InlineHead label={t('product')} />,
    cell: ({ cell }) => {
      const products = (cell.getValue() as any[]) || [];
      return (
        <RecordTableInlineCell>
          {products.map((p) => (
            <Badge variant="secondary" className="cursor-pointer" key={p._id}>
              {p.name}
            </Badge>
          ))}
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    id: 'excludeProducts',
    accessorKey: 'excludeProducts',
    header: () => <RecordTable.InlineHead label={t('exclude-products')} />,
    cell: ({ cell }) => {
      const excludeProducts = (cell.getValue() as any[]) || [];
      return (
        <RecordTableInlineCell>
          {excludeProducts.map((p) => (
            <Badge variant="secondary" className="cursor-pointer" key={p._id}>
              {p.name}
            </Badge>
          ))}
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    id: 'tags',
    accessorKey: 'tags',
    header: () => <RecordTable.InlineHead label={t('tags')} />,
    cell: ({ cell }) => {
      const tags = (cell.getValue() as any[]) || [];
      return (
        <RecordTableInlineCell>
          {tags.map((tag) => (
            <Badge variant="secondary" className="cursor-pointer" key={tag._id}>
              {tag.name}
            </Badge>
          ))}
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'excludeTags',
    accessorKey: 'excludeTags',
    header: () => <RecordTable.InlineHead label={t('exclude-tags')} />,
    cell: ({ cell }) => {
      const excludeTags = (cell.getValue() as any[]) || [];
      return (
        <RecordTableInlineCell>
          {excludeTags.map((tag) => (
            <Badge variant="secondary" className="cursor-pointer" key={tag._id}>
              {tag.name}
            </Badge>
          ))}
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
];
