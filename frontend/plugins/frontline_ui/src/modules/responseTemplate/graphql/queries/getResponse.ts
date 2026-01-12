import { gql } from '@apollo/client';

const GET_RESPONSE = gql`
  query ResponseTemplate($id: String!) {
    responseTemplate(_id: $id) {
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

export { GET_RESPONSE };
