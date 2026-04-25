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

export const GET_COMMENTS = gql`
  query InstagramGetComments(
    $conversationId: String!
    $getFirst: Boolean
    $skip: Int
    $limit: Int
  ) {
    instagramGetComments(
      conversationId: $conversationId
      getFirst: $getFirst
      skip: $skip
      limit: $limit
    ) {
      _id
      content
      conversationId
      commentId
      postId
      recipientId
      senderId
      erxesApiId
      timestamp
      permalink_url
      parentId
      commentCount
      isResolved
      customer {
        _id
        userId
        firstName
        lastName
        profilePic
      }
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
