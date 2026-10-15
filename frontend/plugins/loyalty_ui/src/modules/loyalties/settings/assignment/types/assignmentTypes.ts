import type {
  GetAssignmentCampaignQuery,
  GetCampaignsQuery,
} from '~/gql/graphql';

export type IAssignment = NonNullable<
  NonNullable<
    NonNullable<GetCampaignsQuery['assignmentCampaigns']>['list']
  >[number]
>;

export type IAssignmentDetail = NonNullable<
  GetAssignmentCampaignQuery['assignmentCampaignDetail']
>;
