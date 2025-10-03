import gql from 'graphql-tag';

export const GET_TEAMS = gql`
  query getTeams(
    $name: String
    $userId: String
    $teamIds: [String]
    $projectId: String
  ) {
    getTeams(
      name: $name
      userId: $userId
      teamIds: $teamIds
      projectId: $projectId
    ) {
      _id
      icon
      name
      description
      estimateType
      createdAt
      updatedAt
      cycleEnabled
      taskCount
      memberCount
    }
  }
`;
