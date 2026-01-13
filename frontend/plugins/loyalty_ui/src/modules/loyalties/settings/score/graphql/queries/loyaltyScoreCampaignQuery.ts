import { gql } from '@apollo/client';

export const LOYALTY_SCORE_CAMPAIGN_QUERY = gql`
  query GetCampaigns(
    $searchValue: String
    $status: String
    $fromDate: String
    $toDate: String
    $dateField: String
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
    $kind: String
  ) {
    getCampaigns(
      searchValue: $searchValue
      status: $status
      fromDate: $fromDate
      toDate: $toDate
      dateField: $dateField
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
      kind: $kind
    ) {
      list {
        _id
        name
        description
        startDate
        endDate
        status
        type
        amount
        createdBy {
          email
          details {
            firstName
            fullName
            lastName
            avatar
            middleName
            shortName
          }
        }
        updatedBy {
          email
          details {
            avatar
            firstName
            fullName
            lastName
            shortName
            middleName
          }
        }
        conditions
        kind
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;
