export const types = `
  type WebbuilderPage {
    _id: String!
    name: String
    description: String
    html: String
    css: String
    jsonData: JSON
  }

  type WebbuilderContentType {
    _id: String!
    code: String!
    displayName: String
    fields: JSON
    entries: [WebbuilderEntry]
  }

  type WebbuilderEntry {
    _id: String!
    contentTypeId: String
    values: JSON
  }

  type WebbuilderTemplate {
    _id: String!
    name: String
    jsonData: JSON,
  }
`;

export const queries = `
  webbuilderPages(page: Int perPage: Int): [WebbuilderPage]
  webbuilderPagesTotalCount: Int
  webbuilderPageDetail(_id: String!): WebbuilderPage
  webbuilderContentTypes(page: Int perPage: Int): [WebbuilderContentType ]
  webbuilderContentTypesTotalCount: Int
  webbuilderContentTypeDetail(_id: String!): WebbuilderContentType 
  webbuilderEntries(contentTypeId: String! page: Int perPage: Int): [WebbuilderEntry]
  webbuilderEntriesTotalCount(contentTypeId: String! page: Int perPage: Int): Int
  webbuilderEntryDetail(_id: String!): WebbuilderEntry
  webbuilderTemplates: [WebbuilderTemplate]
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
  webbuilderPagesRemove(_id: String!): JSON
  webbuilderContentTypesAdd(${contentTypeParams}): WebbuilderContentType 
  webbuilderContentTypesEdit(_id: String!, ${contentTypeParams}): WebbuilderContentType 
  webbuilderContentTypesRemove(_id: String!): JSON
  webbuilderEntriesAdd(contentTypeId: String! values: JSON): WebbuilderEntry
  webbuilderEntriesEdit(_id: String!, contentTypeId: String! values: JSON): WebbuilderEntry
  webbuilderEntriesRemove(_id: String!): JSON
  webbuilderTemplatesAdd(name: String, jsonData: JSON): WebbuilderTemplate 
  webbuilderTemplatesRemove(_id: String!): JSON
`;
