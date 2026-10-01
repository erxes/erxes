import { gql } from '@apollo/client';

export const QUERY_SCORE_CAMPAIGN_DETAIL = gql`
  query GetScoreCampaignDetail($_id: String) {
    scoreCampaign(_id: $_id) {
      _id
      title
      description
      order
      status
      ownerType
      serviceName
      restrictions
      add
      subtract
      accountTypeId
      fieldId
      additionalConfig
      createdAt
    }
  }
`;
