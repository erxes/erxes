const Query = ` 
  extend type Query {
    forumCategory(_id: String!): ForumCategory
    forumAllCategories: [ForumCategory]
  }
`;

export default Query;
