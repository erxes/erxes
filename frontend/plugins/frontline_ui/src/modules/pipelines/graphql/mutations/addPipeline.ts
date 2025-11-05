import { gql } from '@apollo/client';

export const ADD_PIPELINE = gql`
  mutation CreatePipeline(
    $name: String!
    $channelId: String!
    $description: String
    $order: Int
  ) {
    createPipeline(
      name: $name
      channelId: $channelId
      description: $description
      order: $order
    ) {
      _id
      channelId
      createdAt
      description
      name
      updatedAt
      userId
    }
  }
`;
