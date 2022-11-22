export const types = `
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type WebbuilderPage {
    _id: String!
    name: String
    description: String
    html: String
    css: String
    siteId: String
    site: WebbuilderSite
    
    createdUser: User
    updatedUser: User
  }

  type WebbuilderPagesList {
    list: [WebbuilderPage]
    totalCount: Int
  }

  type WebbuilderContentType {
    _id: String!
    code: String!
    displayName: String
    fields: JSON
    entries: [WebbuilderEntry]
    siteId: String
    site: WebbuilderSite
  }

  type WebbuilderContentTypesList {
    list: [WebbuilderContentType]
    totalCount: Int
  }

  type WebbuilderEntry {
    _id: String!
    contentTypeId: String
    values: JSON
  }

  type WebbuilderEntriesList {
    list: [WebbuilderEntry]
    totalCount: Int
  }

  type WebbuilderTemplate {
    _id: String!
    name: String
    html: String
    image: String
  }

  type WebbuilderSite {
    _id: String!
    name: String
    domain: String
    templateImage: String 
  }
`;

export const queries = `
  webbuilderPagesMain(page: Int, perPage: Int, searchValue: String, siteId: String): WebbuilderPagesList
  webbuilderPageDetail(_id: String!): WebbuilderPage

  webbuilderContentTypes(siteId: String): [WebbuilderContentType]
  webbuilderContentTypesMain(page: Int, perPage: Int, siteId: String): WebbuilderContentTypesList 
  webbuilderContentTypeDetail(_id: String!): WebbuilderContentType 

  webbuilderEntriesMain(contentTypeId: String! page: Int perPage: Int): WebbuilderEntriesList
  webbuilderEntryDetail(_id: String!): WebbuilderEntry

  webbuilderTemplates(page: Int, perPage: Int): [WebbuilderTemplate]
  webbuilderTemplatesTotalCount: Int
  webbuilderTemplateDetail(_id: String!): WebbuilderTemplate

  webbuilderSites(page: Int, perPage: Int, fromSelect: Boolean): [WebbuilderSite]
  webbuilderSitesTotalCount: Int
`;

const params = `
  name: String!,
  description: String,
  html: String,
  css: String,
  siteId: String,
`;

const contentTypeParams = `
  displayName: String
  code: String
  fields: JSON
  siteId: String
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

  webbuilderTemplatesAdd(name: String, html: String): WebbuilderTemplate 
  webbuilderTemplatesUse(_id: String!, name: String!): String
  webbuilderTemplatesRemove(_id: String!): JSON
  
  webbuilderSitesAdd(name: String domain: String): WebbuilderSite 
  webbuilderSitesEdit(_id: String! name: String domain: String): WebbuilderSite 
  webbuilderSitesRemove(_id: String!): JSON 
`;
