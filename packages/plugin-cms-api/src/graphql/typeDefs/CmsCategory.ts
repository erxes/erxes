export default `
  type CmsCategory @key(fields: "_id") {
    _id: String!
    name: String!
    parentId: String

    parentCategory: CmsCategory
    subCategories: [CmsCategory]
    descendantCategories: [CmsCategory]
  }
`;
