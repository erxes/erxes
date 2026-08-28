import { gql } from '@apollo/client';

const COMMENT_FIELDS = `
  _id
  postId
  clientPortalId
  content
  authorKind
  authorId
  parentId
  status
  createdAt
  updatedAt
  __typename
`;

export const CMS_POST_COMMENT_ADD = gql`
  mutation CmsPostCommentAdd($input: PostCommentInput!) {
    cmsPostCommentAdd(input: $input) {
      ${COMMENT_FIELDS}
    }
  }
`;

export const CMS_POST_COMMENT_UPDATE = gql`
  mutation CmsPostCommentUpdate($_id: String!, $content: String!) {
    cmsPostCommentUpdate(_id: $_id, content: $content) {
      ${COMMENT_FIELDS}
    }
  }
`;

export const CMS_POST_COMMENT_DELETE = gql`
  mutation CmsPostCommentDelete($_id: String!) {
    cmsPostCommentDelete(_id: $_id)
  }
`;

export const CMS_POST_COMMENT_CHANGE_STATUS = gql`
  mutation CmsPostCommentChangeStatus($_id: String!, $status: PostCommentStatus!) {
    cmsPostCommentChangeStatus(_id: $_id, status: $status) {
      ${COMMENT_FIELDS}
    }
  }
`;
