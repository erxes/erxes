const Mutation = `
  extend type Mutation {
    forumTestMutation: String
    # forumCreateRootCategory(name: String!): ForumCategory
    # forumCreateSubCategory(name: String!, parentId: String!): ForumCategory
    forumCreateCategory(name: String!, parentId: String): ForumCategory
  }
`;

export default Mutation;
