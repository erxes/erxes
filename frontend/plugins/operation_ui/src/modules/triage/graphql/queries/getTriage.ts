import gql from 'graphql-tag';

export const GET_TRIAGE = gql`
  query operationGetTriage($id: String!) {
    operationGetTriage(_id: $id) {
      _id
      name
      description: String
      teamId: String
      createdBy: String
      number: Int
      createdAt: Date
      updatedAt: Date
    }
  }
`;
