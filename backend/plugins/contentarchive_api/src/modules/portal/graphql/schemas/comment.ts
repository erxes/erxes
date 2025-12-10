import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';


export const types = `
  type ClientPortalComment @key(fields: "_id") {
    _id: String!
    type: String,
    typeId: String,
    userId: String,
    
    userType: String,
    content: String

    createdUser: ClientPortalUser
    createdAt: Date
  }

  type ClientPortalCommentListResponse {
    list: [ClientPortalComment]
    totalCount: Int
    pageInfo: PageInfo
  }
`;

export const queries = `
  clientPortalComments(typeId: String! type: String!,${GQL_CURSOR_PARAM_DEFS}): ClientPortalCommentListResponse
`;
