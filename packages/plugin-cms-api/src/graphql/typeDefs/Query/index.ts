const Query = ` 
  extend type Query {
    cmsCategoryById(_id: String!): CmsCategory
    cmsAllCategories(): [CmsCategory]
    cmsRootCategories(): [CmsCategory]
  }
`;

export default Query;
