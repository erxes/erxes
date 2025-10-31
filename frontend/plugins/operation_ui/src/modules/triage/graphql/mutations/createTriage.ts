import gql from 'graphql-tag';

export const CREATE_TRIAGE_MUTATION = gql`
  mutation operationAddTriage($input: ITriageInput!) {
    operationAddTriage(input: $input) {
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
