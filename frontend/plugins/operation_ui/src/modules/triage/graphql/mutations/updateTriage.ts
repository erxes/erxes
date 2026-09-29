import { graphql } from '~/gql';

export const UPDATE_TRIAGE_MUTATION = graphql(`
  mutation operationUpdateTriage($_id: String!, $input: ITriageUpdateInput!) {
    operationUpdateTriage(_id: $_id, input: $input) {
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
`);
