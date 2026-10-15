import type { LotteryCampaignsQuery } from '~/gql/graphql';

export type ILottery = NonNullable<
  NonNullable<
    NonNullable<LotteryCampaignsQuery['lotteryCampaigns']>['list']
  >[number]
>;
