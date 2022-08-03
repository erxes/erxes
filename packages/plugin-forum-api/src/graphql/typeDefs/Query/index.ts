const Query = ` 
  extend type Query {
    forumCategory(_id: ID!): ForumCategory
    forumAllCategories(_ids: [ID!], parentIds: [ID], ancestorIds: [ID!]): [ForumCategory]
  }
`;

export default Query;
