const Query = ` 
  extend type Query {
    # cmsTestQuery(): String
    cmsCategory(_id: String!): CmsCategory
    cmsAllCategories: [CmsCategory]
    # cmsRootCategories(): [CmsCategory]
  }
`;

export default Query;
