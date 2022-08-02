const Query = ` 
  extend type Query {
    # forumTestQuery(): String
    forumCategory(_id: String!): ForumCategory
    forumAllCategories: [ForumCategory]
    # forumRootCategories(): [ForumCategory]
  }
`;

export default Query;
