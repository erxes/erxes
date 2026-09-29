import { graphql } from '~/gql';

export const GET_ACTIVITIES = graphql(`
  query getOperationActivities(
    $contentId: String!
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
    getOperationActivities(
      contentId: $contentId
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      limit: $limit
    ) {
      list {
        _id
        module
        action
        contentId
        metadata {
          newValue
          previousValue
        }
        createdBy
        createdAt
        updatedAt
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
