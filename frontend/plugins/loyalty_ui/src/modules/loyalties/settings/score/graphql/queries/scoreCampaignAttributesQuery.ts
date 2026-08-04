import { gql } from '@apollo/client';

export const SCORE_CAMPAIGN_ATTRIBUTES_QUERY = gql`
  query Query($serviceName: String) {
    scoreCampaignAttributes(serviceName: $serviceName)
  }
`;
