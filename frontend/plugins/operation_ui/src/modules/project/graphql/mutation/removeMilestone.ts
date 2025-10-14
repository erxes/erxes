import gql from 'graphql-tag';

export const REMOVE_MILESTONE_MUTATION = gql`
  mutation RemoveMilestone($_id: String!) {
    removeMilestone(_id: $_id) {
      _id
      projectId
    }
  }
`;
