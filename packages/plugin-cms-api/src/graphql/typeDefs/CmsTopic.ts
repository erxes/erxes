export default `
  type CmsTopic @key(fields: "_id") {
    _id: String!
    name: String!
    categories: [CmsCategory]
    descendantCategories: [CmsCategory]
  }
`;
