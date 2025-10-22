import gql from 'graphql-tag';

export const GET_MILESTONE = gql`
  query getMilestone($_id: String!) {
    getMilestone(_id: $_id) {
      _id
      name
      targetDate
    }
  }
`;
