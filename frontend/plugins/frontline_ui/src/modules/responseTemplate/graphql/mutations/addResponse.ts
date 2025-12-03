import { gql } from '@apollo/client';

const ADD_RESPONSE = gql`
  mutation ResponseTemplatesAdd(
    $name: String!
    $content: String
    $channelId: String
    $files: [String]
  ) {
    responseTemplatesAdd(
      name: $name
      content: $content
      channelId: $channelId
      files: $files
    ) {
      _id
      name
      content
      channelId
      createdAt
      updatedAt
      files
    }
  }
`;

export { ADD_RESPONSE };
