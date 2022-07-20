export const types = `
  type WebbuilderPage {
    _id: String!
    name: String
    description: String
    html: String
    css: String
    jsonData: JSON
  }

  type ContentType {
    _id: String!
    code: String!
    displayName: String
    fields: JSON
  }
`;

export const queries = `
  webbuilderPages: [WebbuilderPage]
  webbuilderPageDetail(_id: String!): WebbuilderPage
  webbuilderContentTypes: [ContentType]
  webbuilderContentTypeDetail(_id: String!): ContentType
`;

const params = `
  name: String!,
  description: String,
  html: String,
  css: String,
  jsonData: JSON,
`;

const contentTypeParams = `
  displayName: String
  code: String
  fields: JSON
`;

export const mutations = `
  webbuilderPagesAdd(${params}): WebbuilderPage
  webbuilderPagesEdit(_id: String!, ${params}): WebbuilderPage
  webbuilderContentTypesAdd(${contentTypeParams}): ContentType
  webbuilderContentTypesEdit(_id: String!, ${contentTypeParams}): ContentType
  webbuilderContentTypesRemove(_id: String!): JSON
`;
