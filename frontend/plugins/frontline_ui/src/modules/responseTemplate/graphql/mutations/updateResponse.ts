import { gql } from '@apollo/client';

const UPDATE_RESPONSE = gql`
  mutation ResponseTemplatesEdit(
    $name: String!
    $id: String
    $content: String
    $channelId: String
    $files: [String]
  ) {
    responseTemplatesEdit(
      name: $name
      _id: $id
      content: $content
      channelId: $channelId
      files: $files
    ) {
      _id
    }
  }
`;

export { UPDATE_RESPONSE };
