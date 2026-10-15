import type {
  GetDonateCampaignQuery,
  GetDonateCampaignsQuery,
} from '~/gql/graphql';

export type IDonation = NonNullable<
  NonNullable<
    NonNullable<GetDonateCampaignsQuery['donateCampaigns']>['list']
  >[number]
>;

export type IDonationDetail = NonNullable<
  GetDonateCampaignQuery['donateCampaignDetail']
>;
