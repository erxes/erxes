export default `
  type CmsCategory @key(fields: "_id") {
    _id: String!
    name: String!
    parentCategoryId: String
    topicId: String

    parentCategory: CmsCategory
    subCategories: [CmsCategory]
    descendantCategories: [CmsCategory]
  }
`;
