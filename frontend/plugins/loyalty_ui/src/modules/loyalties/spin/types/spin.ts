import type { SpinsMainQuery } from '~/gql/graphql';
export type ISpin = NonNullable<
  NonNullable<NonNullable<SpinsMainQuery['spinsMain']>['list']>[number]
>;
