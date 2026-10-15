import { gql } from '~/gql';

export const QUERY_ASSIGNMENT_CAMPAIGNS = gql(`
  query GetCampaigns(
    $searchValue: String
    $status: String
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
    assignmentCampaigns(
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
        fieldId
        allowMultiWin
        segmentIds
        voucherCampaignId
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
