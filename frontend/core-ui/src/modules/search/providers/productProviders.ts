import { IconTag } from '@tabler/icons-react';
import { defineSearchProvider, readCursorList } from 'erxes-ui';

const UNNAMED = 'Unnamed';

type TProductNode = {
  _id: string;
  name?: string | null;
  code?: string | null;
  unitPrice?: number | null;
};

export const productsSearchProvider = defineSearchProvider<TProductNode>({
  key: 'core-products',
  label: 'Products',
  labelKey: 'products',
  labelNamespace: 'common',
  icon: IconTag,
  order: 40,
  selections: [
    {
      alias: 'gs_core_products',
      field: 'productsMain',
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward',
      body: '{ list { _id name code unitPrice } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) =>
    readCursorList<TProductNode>(payload, 'gs_core_products'),
  toItem: (product) => ({
    id: product._id,
    title: product.name || UNNAMED,
    description: product.code || undefined,
    path: `/settings/products?product_id=${product._id}`,
  }),
});
