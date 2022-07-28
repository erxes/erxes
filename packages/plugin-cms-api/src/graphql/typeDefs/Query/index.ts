const Query = ` 
  extend type Query {
    # cmsTestQuery(): String
    # cmsCategoryById(_id: String!): CmsCategory
     cmsAllCategories: [CmsCategory]
    # cmsRootCategories(): [CmsCategory]
  }
`;

export default Query;
