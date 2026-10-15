import { gql } from '~/gql';

export const QUERY_DONATE_CAMPAIGNS = gql(`
  query GetDonateCampaigns(
    $searchValue: String
    $status: String
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
    donateCampaigns(
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
        maxScore
        awards
        donatesCount
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
`);
