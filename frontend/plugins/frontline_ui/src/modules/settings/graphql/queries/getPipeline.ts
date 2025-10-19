import { gql } from '@apollo/client';

export const GET_PIPELINE = gql`
  query GetPipeline($id: String!) {
    getTicketPipeline(_id: $id) {
      _id
      channelId
      createdAt
      createdUser {
        _id
        details {
          avatar
          fullName
        }
      }
      description
      name
      updatedAt
    }
  }
`;
