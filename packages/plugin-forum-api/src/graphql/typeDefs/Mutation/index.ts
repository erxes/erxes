const Mutation = `

  extend type Mutation {

    forumCreateRootCategory(name: String!): ForumCategory
    forumPatchRootCategory(_id: ID!, name: String): ForumCategory

    forumCreateSubCategory(name: String!, parentId: String!): ForumCategory
    forumPatchSubCategory(_id: ID!, name: String, parentId: String): ForumCategory

    forumCreateCategory(name: String!, parentId: String): ForumCategory
    forumPatchCategory(_id: ID!, name: String, parentId: String): ForumCategory
  }
`;

export default Mutation;
