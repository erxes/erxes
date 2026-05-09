export const types = `
  type Layouts {
    _id: String
    name: String
    slug: String
    type: String
    config: JSON
    isPublished: Boolean
    createdAt: Date
    updatedAt: Date
  }

  input LayoutsInput {
    name: String!
    slug: String!
    type: String!
    config: JSON
    isPublished: Boolean
  }
`;

export const queries = `
  getLayouts(_id: String!): Layouts
  getLayoutsBySlug(slug: String!): Layouts
  getLayoutss: [Layouts]
`;

export const mutations = `
  createLayouts(doc: LayoutsInput!): Layouts
  updateLayouts(_id: String!, doc: LayoutsInput!): Layouts
  removeLayouts(_id: String!): JSON
`;
