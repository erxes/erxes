import type { BmsAmenitiesQuery } from '~/gql/graphql';

export type IAmenity = NonNullable<
  NonNullable<NonNullable<BmsAmenitiesQuery['bmsElements']>['list']>[number]
>;
