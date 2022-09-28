export const commonPostsParams = `
  state: [ForumPostState!]
  categoryIncludeDescendants: Boolean
  createdById: [String!]
  createdByCpId: [String!]

  sort: JSON
  offset: Int
  limit: Int
`;

const forumPostsQueryParams = `
  _id: [ID!]
  categoryId: [ID!]
  ${commonPostsParams}
`;

export const commentQParams = `
  _id: [ID!]
  postId: [ID!]
  replyToId: [ID]
  sort: JSON
  offset: Int
  limit: Int
`;

const Query = ` 
  extend type Query {
    forumCategoryByCode(code: String!): ForumCategory
    forumCategory(_id: ID!): ForumCategory
    forumCategories(_id: [ID!], parentId: [ID], code: [String!]): [ForumCategory!]
    forumCategoryQuery(query: JSON!): [ForumCategory!]
    forumCategoryPossibleParents(_id: ID): [ForumCategory!]

    forumPost(_id: ID!): ForumPost
    forumPosts(${forumPostsQueryParams}): [ForumPost!]
    forumPostsCount(${forumPostsQueryParams}): Int

    forumComments(${commentQParams}): [ForumComment!]
    forumCommentsCount(${commentQParams}): Int
    forumComment(_id: ID!): ForumComment

    forumCateogryIsDescendantRelationship(ancestorId: ID!, descendantId: ID!): Boolean
  }
`;

export default Query;
