const Query = ` 
  extend type Query {
    forumCategoryByCode(code: String!): ForumCategory
    forumCategory(_id: ID!): ForumCategory
    forumCategories(_id: [ID!], parentId: [ID], ancestorIds: [ID!], code: [String!]): [ForumCategory!]
    forumCategoryQuery(query: JSON!): [ForumCategory!]

    forumPost(_id: ID!): ForumPost
    forumPosts(_id: [ID!], categoryId: [ID!], offset: Int, limit: Int): [ForumPost!]
  }
`;

export default Query;
