export const types = () => `
  type Comment {
    _id: String
    contentId: String
    parentId: String
    content: String
    childCount: Int
    createdAt: Date
    updatedAt: Date
  }

  type CommentResponse {
    list: [Comment]
    totalCount: Int
  }
`;

export const queries = `
  activityComments(contentId: String!, parentId: String, page: Int, perPage: Int): CommentResponse
  activityCommentCount(contentId: String!): Int
`;

const commentCommonParams = `
  contentId: String!
  content: String!
  parentId: String
`;

export const mutations = `
  activityCommentAdd(${commentCommonParams}): Comment
  activityCommentEdit(_id: String, ${commentCommonParams}): Comment
  activityCommentRemove(_id: String!): JSON
`;
