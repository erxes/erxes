import { graphql } from '~/gql';

export const GET_TRIAGE = graphql(`
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
      status
    }
  }
`);
