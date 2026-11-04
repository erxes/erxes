import type { BmToursGroupQuery, BmsToursQuery } from '~/gql/graphql';

export type ITour = NonNullable<
  NonNullable<NonNullable<BmsToursQuery['bmsTours']>['list']>[number]
>;

export type ITourGroup = NonNullable<
  NonNullable<NonNullable<BmToursGroupQuery['bmToursGroup']>['list']>[number]
>;
