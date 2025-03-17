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
  programComments(contentId: String!, parentId: String, page: Int, perPage: Int): CommentResponse
  programCommentCount(contentId: String!): Int
`;

const commentCommonParams = `
  contentId: String!
  content: String!
  parentId: String
`;

export const mutations = `
  programCommentAdd(${commentCommonParams}): Comment
  programCommentEdit(_id: String, ${commentCommonParams}): Comment
  programCommentRemove(_id: String!): JSON
`;
