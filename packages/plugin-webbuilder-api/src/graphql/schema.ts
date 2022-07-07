export const types = `
  type WebbuilderPage {
    _id: String!
    name: String
    description: String
    html: String
    css: String
    jsonData: JSON
  }
`;

export const queries = `
  webbuilderPages: [WebbuilderPage]
  webbuilderPageDetail(_id: String!): WebbuilderPage
`;

const params = `
  name: String!,
  description: String,
  html: String,
  css: String,
  jsonData: JSON,
`;

export const mutations = `
  webbuilderPagesAdd(${params}): WebbuilderPage
  webbuilderPagesEdit(_id: String!, ${params}): WebbuilderPage
`;
