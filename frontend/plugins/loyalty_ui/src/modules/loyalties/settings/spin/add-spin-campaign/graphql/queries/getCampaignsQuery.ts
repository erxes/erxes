import { gql } from '@apollo/client';

export const QUERY_SPIN_CAMPAIGNS = gql`
  query GetSpinCampaigns(
    $searchValue: String
    $status: String
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
    spinCampaigns(
      searchValue: $searchValue
      status: $status

      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      limit: $limit
    ) {
      list {
        _id
        createdAt
        createdBy
        modifiedAt
        modifiedBy
        title
        description
        startDate
        endDate
        finishDateOfUse
        attachment {
          url
          name
          size
          type
          __typename
        }
        status
        buyScore
        awards
        spinsCount
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;
