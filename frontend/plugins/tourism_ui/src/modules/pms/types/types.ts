import type { PmsProductCategoriesQuery } from '~/gql/graphql';

export type IProductCategory = NonNullable<
  NonNullable<PmsProductCategoriesQuery['productCategories']>[number]
>;
