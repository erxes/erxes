import { gql } from '@apollo/client';

export const LOYALTY_SCORE_CAMPAIGN_QUERY = gql`
  query ScoreCampaigns(
    $page: Int
    $perPage: Int
    $searchValue: String
    $status: String
  ) {
    scoreCampaigns(
      page: $page
      perPage: $perPage
      searchValue: $searchValue
      status: $status
    ) {
      _id
      title
      description
      add
      subtract
      createdAt
      createdUserId
      status
      ownerType
      fieldGroupId
      fieldName
      fieldId
      serviceName
      additionalConfig
      restrictions
      onlyClientPortal
      __typename
    }
    scoreCampaignsTotalCount(
      page: $page
      perPage: $perPage
      searchValue: $searchValue
      status: $status
    )
  }
`;
