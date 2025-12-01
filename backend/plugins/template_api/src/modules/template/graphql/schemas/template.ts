export const types = `
  type Template {
    _id: String
    name: String
    description: String
  }
`;

export const queries = `
  getTemplate(_id: String!): Template
  getTemplates: [Template]
`;

export const mutations = `
  createTemplate(name: String!): Template
  updateTemplate(_id: String!, name: String!): Template
  removeTemplate(_id: String!): Template
`;
