import { gql } from '~/gql';

export const GET_POST = gql(`
  query facebookGetPost($erxesApiId: String!) {
    facebookGetPost(erxesApiId: $erxesApiId) {
      _id
      content
      permalink_url
      attachments
    }
  }
`);
