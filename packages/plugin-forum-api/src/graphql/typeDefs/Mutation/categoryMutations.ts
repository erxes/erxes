const insertParams = `
  name: String!
  code: String
  thumbnail: String
`;

const patchParams = `
  name: String
  code: String
  thumbnail: String
`;

const categoryMutations = `
  forumCreateRootCategory(
    ${insertParams}
  ): ForumCategory

  forumPatchRootCategory(
    _id: ID!
    ${patchParams}
  ): ForumCategory

  forumCreateSubCategory(
    parentId: String!
    ${insertParams}
  ): ForumCategory

  forumPatchSubCategory(
    _id: ID!
    parentId: String
    ${patchParams}
  ): ForumCategory

  forumCreateCategory(
    parentId: String
    ${insertParams}
  ): ForumCategory

  forumPatchCategory(
    _id: ID!
    parentId: String
    ${patchParams}
  ): ForumCategory
`;

export default categoryMutations;
