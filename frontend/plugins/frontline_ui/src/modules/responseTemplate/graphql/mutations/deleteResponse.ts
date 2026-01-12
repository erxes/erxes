import { gql } from '@apollo/client';

export const REMOVE_RESPONSE = gql`
  mutation ResponseTemplatesRemove($id: String!) {
    responseTemplatesRemove(_id: $id) {
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
