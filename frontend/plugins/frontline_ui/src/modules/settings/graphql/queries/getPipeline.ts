import { gql } from '@apollo/client';

export const GET_PIPELINE = gql`
  query GetTicketPipeline($id: String!) {
    getTicketPipeline(_id: $id) {
      _id
      name
      channelId
      pipelineId
      description
      userId
      createdAt
      updatedAt
      createdUser {
        _id
        details {
          avatar
          fullName
        }
      }
    }
  }
`;
