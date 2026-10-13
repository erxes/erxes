import { gql } from '~/gql';

export const GET_MILESTONES_INLINE = gql(`
  query GetMilestones(
    $projectId: String!
    $searchValue: String
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
    milestones(
      projectId: $projectId
      searchValue: $searchValue
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      limit: $limit
    ) {
      list {
        _id
        name
        targetDate
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
