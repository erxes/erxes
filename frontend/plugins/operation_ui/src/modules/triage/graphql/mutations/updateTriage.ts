import gql from 'graphql-tag';

export const UPDATE_TRIAGE_MUTATION = gql`
  mutation operationUpdateTriage($_id: String!, $input: ITriageInput!) {
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
`;
