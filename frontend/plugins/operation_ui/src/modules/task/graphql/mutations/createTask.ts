import { gql } from '@apollo/client';

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask(
    $name: String!
    $teamId: String!
    $description: String
    $status: String
    $priority: Int
    $estimatePoint: Int
    $startDate: Date
    $targetDate: Date
    $assigneeId: String
    $cycleId: String
    $projectId: String
  ) {
    createTask(
      name: $name
      teamId: $teamId
      description: $description
      status: $status
      priority: $priority
      estimatePoint: $estimatePoint
      startDate: $startDate
      targetDate: $targetDate
      assigneeId: $assigneeId
      cycleId: $cycleId
      projectId: $projectId
    ) {
      _id
    }
  }
`;
