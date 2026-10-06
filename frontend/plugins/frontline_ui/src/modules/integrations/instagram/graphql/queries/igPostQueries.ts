import { gql } from '@apollo/client';

export const GET_POST = gql`
  query InstagramGetPost($erxesApiId: String!) {
    instagramGetPost(erxesApiId: $erxesApiId) {
      _id
      content
      permalink_url
      attachments
    }
  }
`;

export const GET_COMMENT_COUNT = gql`
  query InstagramGetCommentCount(
    $conversationId: String!
    $isResolved: Boolean
  ) {
    instagramGetCommentCount(
      conversationId: $conversationId
      isResolved: $isResolved
    )
  }
`;
