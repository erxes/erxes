import { gql } from '@apollo/client';

export const getCampaignsQuery = gql`
  query GetCampaigns(
    $searchValue: String
    $status: String
    $fromDate: String
    $toDate: String
    $dateField: String
    $kind: String
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
  ) {
    getCampaigns(
      searchValue: $searchValue
      status: $status
      fromDate: $fromDate
      toDate: $toDate
      dateField: $dateField
      kind: $kind
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
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
            avatar
            firstName
            fullName
            lastName
            middleName
            position
          }
        }
        updatedBy {
          email
          details {
            avatar
            firstName
            fullName
            lastName
            middleName
            position
          }
        }
        conditions
        kind
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
