export default `
  type CmsCategory @key(fields: "_id") {
    _id: ID!
    name: String!
    parentId: ID

    parent: CmsCategory
    children: [CmsCategory!]
    descendants: [CmsCategory!]
    ancestors: [CmsCategory!]
  }
`;
