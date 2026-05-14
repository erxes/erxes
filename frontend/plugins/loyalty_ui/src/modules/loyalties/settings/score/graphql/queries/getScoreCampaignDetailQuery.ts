import { gql } from '@apollo/client';

export const QUERY_SCORE_CAMPAIGN_DETAIL = gql`
  query GetScoreCampaignDetail($_id: String) {
    scoreCampaign(_id: $_id) {
      _id
      title
      description
      status
      ownerType
      serviceName
      restrictions
      add
      subtract
      fieldGroupId
      fieldName
      fieldId
      additionalConfig
      onlyClientPortal
      createdAt
    }
  }
`;
