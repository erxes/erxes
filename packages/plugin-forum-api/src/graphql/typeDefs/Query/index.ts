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

    forumComments(_id: [ID!], postId: [ID!], replyToId: [ID], offset: Int, limit: Int): [ForumComment!]
    forumComment(_id: ID!): ForumComment

    forumCateogryIsDescendantRelationship(ancestorId: ID!, descendantId: ID!): Boolean
  }
`;

export default Query;
