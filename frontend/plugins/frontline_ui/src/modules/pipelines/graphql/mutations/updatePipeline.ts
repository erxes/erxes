import { gql } from '@apollo/client';

export const UPDATE_PIPELINE = gql`
  mutation UpdatePipeline(
    $_id: String!
    $description: String
    $name: String
    $order: Int
  ) {
    updatePipeline(
      _id: $_id
      description: $description
      name: $name
      order: $order
    ) {
      _id
      name
      channelId
      description
      userId
      createdAt
      updatedAt
      pipelineId
    }
  }
`;
