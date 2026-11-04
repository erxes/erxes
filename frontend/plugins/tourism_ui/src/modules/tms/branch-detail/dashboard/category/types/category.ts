import type {
  BmsTourCategoriesQuery,
  BmsTourParentCategoriesQuery,
} from '~/gql/graphql';

export type ICategory = NonNullable<
  NonNullable<BmsTourCategoriesQuery['bmsTourCategories']>[number]
>;

export type ICategoryTranslation = NonNullable<
  NonNullable<ICategory['translations']>[number]
>;

export type IParentCategory = NonNullable<
  NonNullable<BmsTourParentCategoriesQuery['bmsTourCategories']>[number]
>;
