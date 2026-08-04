import gql from 'graphql-tag';

export const CREATE_TRIAGE_MUTATION = gql`
  mutation operationAddTriage($input: ITriageAddInput!) {
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
      status
    }
  }
`;
