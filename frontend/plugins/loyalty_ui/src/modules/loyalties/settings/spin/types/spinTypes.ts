import type { GetSpinCampaignsQuery } from '~/gql/graphql';

export type ISpin = NonNullable<
  NonNullable<
    NonNullable<GetSpinCampaignsQuery['spinCampaigns']>['list']
  >[number]
>;
