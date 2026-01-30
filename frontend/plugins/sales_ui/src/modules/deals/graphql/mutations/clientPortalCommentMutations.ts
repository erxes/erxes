import { gql } from '@apollo/client';

export const CLIENT_PORTAL_COMMENT_ADD = gql`
  mutation ClientPortalCommentAdd($comment: CPCommentInput!) {
    clientPortalCommentAdd(comment: $comment) {
      _id
      content
      type
      typeId
      parentId
      userId
      userType
      createdAt
    }
  }
`;
