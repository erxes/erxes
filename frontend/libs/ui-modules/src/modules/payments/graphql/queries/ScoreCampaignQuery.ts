import { gql } from '@apollo/client';

export const SCORE_CAMPAIGNS_SIMPLE_QUERY = gql`
  query ScoreCampaignsSimple($serviceName: String, $limit: Int) {
    scoreCampaigns(serviceName: $serviceName, limit: $limit) {
      list {
        _id
        title
        ownerType
      }
    }
  }
`;
