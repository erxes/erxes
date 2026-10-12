import { gql } from '~/gql';

export const GET_POST = gql(`
  query InstagramGetPost($erxesApiId: String!) {
    instagramGetPost(erxesApiId: $erxesApiId) {
      _id
      content
      permalink_url
      attachments
    }
  }
`);
