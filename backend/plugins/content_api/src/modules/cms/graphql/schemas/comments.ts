import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  enum PostCommentStatus {
    pending
    approved
    rejected
  }

  enum PostCommentAuthorKind {
    user
    portalUser
  }

  type PostComment {
    _id: String!
    postId: String!
    clientPortalId: String!
    content: String!
    authorKind: PostCommentAuthorKind
    authorId: String
    parentId: String
    status: PostCommentStatus
    createdAt: Date
    updatedAt: Date
  }

  type PostCommentList {
    comments: [PostComment]
    totalCount: Int
    pageInfo: PageInfo
  }
`;

export const inputs = `
  input PostCommentInput {
    postId: String!
    clientPortalId: String!
    content: String!
    parentId: String
    status: PostCommentStatus
  }

  input CpPostCommentInput {
    postId: String!
    content: String!
    parentId: String
  }
`;

const commonCommentQueryParams = `
  postId: String!
  parentId: String
  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  cmsPostComments(clientPortalId: String!, ${commonCommentQueryParams}): PostCommentList
  cpPostComments(${commonCommentQueryParams}): PostCommentList
`;

export const mutations = `
  cmsPostCommentAdd(input: PostCommentInput!): PostComment
  cmsPostCommentUpdate(_id: String!, content: String!): PostComment
  cmsPostCommentDelete(_id: String!): JSON
  cmsPostCommentChangeStatus(_id: String!, status: PostCommentStatus!): PostComment

  cpPostCommentAdd(input: CpPostCommentInput!): PostComment
  cpPostCommentUpdate(_id: String!, content: String!): PostComment
  cpPostCommentDelete(_id: String!): JSON
`;
