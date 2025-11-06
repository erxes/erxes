import gql from 'graphql-tag';

export const GET_TEAMS = gql`
  query getTeams(
    $name: String
    $userId: String
    $teamIds: [String]
    $projectId: String
    $isTriageEnabled: Boolean
  ) {
    getTeams(
      name: $name
      userId: $userId
      teamIds: $teamIds
      projectId: $projectId
      isTriageEnabled: $isTriageEnabled
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
`;
