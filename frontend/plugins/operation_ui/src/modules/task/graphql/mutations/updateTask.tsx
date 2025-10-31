import { gql } from '@apollo/client';

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask(
    $_id: String!
    $name: String
    $description: String
    $teamId: String
    $status: String
    $priority: Int
    $assigneeId: String
    $startDate: Date
    $targetDate: Date
    $projectId: String
    $estimatePoint: Int
    $cycleId: String
    $milestoneId: String
    $tagIds: [String]
  ) {
    updateTask(
      _id: $_id
      name: $name
      description: $description
      teamId: $teamId
      status: $status
      priority: $priority
      assigneeId: $assigneeId
      startDate: $startDate
      targetDate: $targetDate
      projectId: $projectId
      estimatePoint: $estimatePoint
      cycleId: $cycleId
      milestoneId: $milestoneId
      tagIds: $tagIds
    ) {
      _id
      tagIds
    }
  }
`;
