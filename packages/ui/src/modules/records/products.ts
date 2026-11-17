import type { UseQueryOptions } from '@tanstack/react-query';

/** A product as a picker shows it. Core's `Product` has these and more. */
export interface ProductChoice {
  id: string;
  name: string;
  code: string | null;
}

type ProductRows = UseQueryOptions<{ data: ProductChoice[] }, Error, { data: ProductChoice[] }>;

/**
 * Where a filter's `product` fields search products and load picked ones.
 * Picked ones load by id, archived ones too. TanStack query options; in erxes, `productSearchQueries` from
 * `@erxes/core-contract/client`.
 */
export interface ProductSearchQueries {
  search: (search: string | undefined) => ProductRows;
  byIds: (ids: string[]) => ProductRows;
}

/** A product's name, with its code when it has one: "iPhone 15 · IP15". */
export const productTitle = (product: Pick<ProductChoice, 'name' | 'code'>) =>
  product.code ? `${product.name} · ${product.code}` : product.name;
