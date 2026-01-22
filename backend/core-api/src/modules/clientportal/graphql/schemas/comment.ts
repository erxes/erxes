import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  enum CPCommentUserType {
    team
    client
  }

  type CPComment {
    _id: String!
    typeId: String
    type: String
    content: String
    parentId: String
    userId: String
    userType: CPCommentUserType
    createdAt: Date
    updatedAt: Date
  }

  type CPCommentListResponse {
    list: [CPComment]
    pageInfo: PageInfo
    totalCount: Int
  }

  input CPCommentInput {
    typeId: String!
    type: String!
    content: String!
    parentId: String
  }

  input CPCommentUpdateInput {
    content: String
    parentId: String
  }

  input CPCommentFilter {
    typeId: String
    type: String
    parentId: String
    userId: String
    userType: CPCommentUserType  
    ${GQL_CURSOR_PARAM_DEFS}
  }
`;

export const queries = `
  clientPortalComment(_id: String!): CPComment
  clientPortalComments(filter: CPCommentFilter): CPCommentListResponse
`;

export const mutations = `
  clientPortalCommentAdd(comment: CPCommentInput!): CPComment
  clientPortalCommentUpdate(_id: String!, comment: CPCommentUpdateInput!): CPComment
  clientPortalCommentDelete(_id: String!): JSON
`;
