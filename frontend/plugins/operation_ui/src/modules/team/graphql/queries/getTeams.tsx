import { gql } from '~/gql';

export const GET_TEAMS = gql(`
  query getTeams(
    $name: String
    $userId: String
    $teamIds: [String]
    $projectId: String
    $isTriageEnabled: Boolean
    $teamId: String
  ) {
    getTeams(
      name: $name
      userId: $userId
      teamIds: $teamIds
      projectId: $projectId
      isTriageEnabled: $isTriageEnabled
      teamId: $teamId
    ) {
      _id
      icon
      name
      description
      estimateType
      createdAt
      updatedAt
      cycleEnabled
      triageEnabled
      taskCount
      memberCount
    }
  }
`);
