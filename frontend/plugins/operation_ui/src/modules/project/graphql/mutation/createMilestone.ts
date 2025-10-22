import gql from 'graphql-tag';

export const CREATE_MILESTONE_MUTATION = gql`
  mutation CreateMilestone(
    $name: String!
    $projectId: String!
    $targetDate: Date
  ) {
    createMilestone(
      name: $name
      projectId: $projectId
      targetDate: $targetDate
    ) {
      _id
      name
      projectId
      targetDate
    }
  }
`;
