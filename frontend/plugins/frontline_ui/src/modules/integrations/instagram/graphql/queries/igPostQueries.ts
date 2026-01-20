import { gql } from '@apollo/client';

export const GET_POST = gql`
  query instagramGetPost($erxesApiId: String!) {
    instagramGetPost(erxesApiId: $erxesApiId) {
      _id
      content
      permalink_url
      attachments
    }
  }
`;
