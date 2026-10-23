import type { BmsElementCategoriesQuery } from '~/gql/graphql';

export type IElementCategory = NonNullable<
  NonNullable<BmsElementCategoriesQuery['bmsElementCategories']>[number]
>;
