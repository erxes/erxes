import type {
  GetScoreCampaignDetailQuery,
  GetScoreCampaignsQuery,
} from '~/gql/graphql';

export type IScore = NonNullable<
  NonNullable<
    NonNullable<GetScoreCampaignsQuery['scoreCampaigns']>['list']
  >[number]
>;

export type IScoreDetail = NonNullable<
  GetScoreCampaignDetailQuery['scoreCampaign']
>;
