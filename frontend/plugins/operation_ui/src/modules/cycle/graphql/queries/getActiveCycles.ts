import { gql } from '@apollo/client';

export const GET_ACTIVE_CYCLES = gql`
  query GetActiveCycles(
    $teamId: String
    $taskId: String
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
  ) {
    getCyclesActive(
      teamId: $teamId
      taskId: $taskId
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
      }
      totalCount
    }
  }
`;
