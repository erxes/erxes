import gql from 'graphql-tag';

export const GET_TRIAGE = gql`
  query operationGetTriage($_id: String!) {
    operationGetTriage(_id: $_id) {
      _id
      name
      description
      teamId
      createdBy
      number
      createdAt
      updatedAt
      priority
    }
  }
`;
