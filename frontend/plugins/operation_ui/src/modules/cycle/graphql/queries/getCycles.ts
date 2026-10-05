import { gql } from '@apollo/client';

export const GET_CYCLES = gql`
  query GetCyclesRecordTable(
    $teamId: String
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
    getCycles(
      teamId: $teamId
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      limit: $limit
    ) {
      list {
        _id
        name
        description
        startDate
        endDate
        teamId
        isCompleted
        isActive
        statistics
        donePercent
        unFinishedTasks
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
