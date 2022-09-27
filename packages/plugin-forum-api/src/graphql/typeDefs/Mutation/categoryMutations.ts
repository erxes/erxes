const params = `
  parentId: String
  name: String!
  code: String
  thumbnail: String
`;

const categoryMutations = `

  forumCreateCategory(
    ${params}
  ): ForumCategory

  forumPatchCategory(
    _id: ID!
    ${params}
  ): ForumCategory

  forumDeleteCategory(_id: ID!): ForumCategory
`;

export default categoryMutations;
