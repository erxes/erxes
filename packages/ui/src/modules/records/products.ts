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

/** A product as product pickers list it: core's `Product` has more. */
export interface ProductRecord extends ProductChoice {
  /** In the currency's smallest unit, as core keeps prices. */
  price: number;
  currency: string;
  unit: string;
  categoryId: string | null;
}

/** A product category: core's `ProductCategory` has these and more. */
export interface ProductCategoryChoice {
  id: string;
  name: string;
  parentId: string | null;
}

/**
 * Where the product pickers read the catalog. TanStack query options; in erxes,
 * `productQueries` from `@erxes/core-contract/client`.
 */
export interface ProductQueries {
  page: (input: {
    search?: string;
    categoryId?: string;
    cursor?: string;
  }) => UseQueryOptions<ProductPage, Error, ProductPage>;
  byIds: (ids: string[]) => UseQueryOptions<RecordRows, Error, RecordRows>;
  categories: UseQueryOptions<CategoryRows, Error, CategoryRows>;
}

type RecordRows = { data: ProductRecord[] };

type CategoryRows = { data: ProductCategoryChoice[] };

/** A page of products: the rows, whether more follow and where, and how many match. */
export interface ProductPage {
  data: ProductRecord[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  totalCount: number;
}

/** A product's name, with its code when it has one: "iPhone 15 · IP15". */
export const productTitle = (product: Pick<ProductChoice, 'name' | 'code'>) =>
  product.code ? `${product.name} · ${product.code}` : product.name;
