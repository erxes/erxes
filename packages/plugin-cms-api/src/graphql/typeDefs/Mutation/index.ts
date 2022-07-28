const Mutation = `
  extend type Mutation {
    cmsTestMutation: String
    # cmsCreateRootCategory(name: String!): CmsCategory
    # cmsCreateSubCategory(name: String!, parentId: String!): CmsCategory
    cmsCreateCategory(name: String!, parentId: String): CmsCategory
  }
`;

export default Mutation;
