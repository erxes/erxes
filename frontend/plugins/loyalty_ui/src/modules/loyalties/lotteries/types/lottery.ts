import type { LotteriesMainQuery } from '~/gql/graphql';
export type ILottery = NonNullable<
  NonNullable<NonNullable<LotteriesMainQuery['lotteriesMain']>['list']>[number]
>;
