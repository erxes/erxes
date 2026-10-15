import { gql } from '~/gql';

export const LOYALTY_SCORE_CAMPAIGN_QUERY = gql(`
  query GetScoreCampaigns(
    $searchValue: String
    $status: String
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
    scoreCampaigns(
      searchValue: $searchValue
      status: $status

      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      limit: $limit
    ) {
      list {
        _id
        title
        description
        order
        add
        subtract
        createdAt
        createdUserId
        status
        ownerType
        accountTypeId
        accountType {
          _id
          name
          status
        }
        fieldId
        additionalConfig
        restrictions
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
`);
