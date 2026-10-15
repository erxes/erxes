import type { DonatesMainQuery } from '~/gql/graphql';
export type IDonate = NonNullable<
  NonNullable<NonNullable<DonatesMainQuery['donatesMain']>['list']>[number]
>;
