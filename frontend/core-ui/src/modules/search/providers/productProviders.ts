import { IconTag } from '@tabler/icons-react';
import { defineSearchProvider, readArray, readNumber } from 'erxes-ui';

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
      field: 'products',
      args: 'searchValue: $searchValue, perPage: $limit',
      body: '{ _id name code unitPrice }',
    },
    {
      alias: 'gs_core_products_count',
      field: 'productsTotalCount',
      args: 'searchValue: $searchValue',
      optional: true,
    },
  ],
  select: (payload) => ({
    nodes: readArray<TProductNode>(payload, 'gs_core_products'),
    totalCount: readNumber(payload, 'gs_core_products_count'),
  }),
  toItem: (product) => ({
    id: product._id,
    title: product.name || UNNAMED,
    description: product.code || undefined,
    path: `/settings/products?product_id=${product._id}`,
  }),
});
