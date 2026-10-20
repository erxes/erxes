import type { PosProductsQuery } from '~/gql/graphql';
export type IProduct = NonNullable<
  NonNullable<NonNullable<PosProductsQuery['posProducts']>['products']>[number]
>;
export type IPosByItems = IProduct;
