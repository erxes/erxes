import gql from 'graphql-tag';

export const UPDATE_MILESTONE_MUTATION = gql`
  mutation UpdateMilestone(
    $id: String!
    $name: String!
    $projectId: String!
    $targetDate: Date
  ) {
    updateMilestone(
      _id: $id
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
