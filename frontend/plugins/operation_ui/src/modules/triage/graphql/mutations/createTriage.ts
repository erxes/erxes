import { graphql } from '~/gql';

export const CREATE_TRIAGE_MUTATION = graphql(`
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
`);
