const Query = ` 
  extend type Query {
    forumCategoryByCode(code: String!): ForumCategory
    forumCategory(_id: ID!): ForumCategory
    forumAllCategories(_id: [ID!], parentId: [ID], ancestorIds: [ID!], code: [String!]): [ForumCategory!]
    forumCategoryQuery(query: JSON!): [ForumCategory!]
  }
`;

export default Query;
