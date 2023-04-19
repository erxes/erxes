import {
  attachmentInput,
  attachmentType
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = `
  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type digitalIncomeRoomPage {
    _id: String!
    name: String
    description: String
    html: String
    css: String
    siteId: String
    site: digitalIncomeRoomSite
    
    createdUser: User
    updatedUser: User
  }

  type digitalIncomeRoomPagesList {
    list: [digitalIncomeRoomPage]
    totalCount: Int
  }

  type digitalIncomeRoomContentType {
    _id: String!
    code: String!
    displayName: String
    fields: JSON
    entries: [digitalIncomeRoomEntry]
    siteId: String
    site: digitalIncomeRoomSite
  }

  type digitalIncomeRoomContentTypesList {
    list: [digitalIncomeRoomContentType]
    totalCount: Int
  }

  type digitalIncomeRoomEntry {
    _id: String!
    contentTypeId: String
    values: JSON
  }

  type digitalIncomeRoomEntriesList {
    list: [digitalIncomeRoomEntry]
    totalCount: Int
  }

  type digitalIncomeRoomTemplate {
    _id: String!
    name: String
    html: String
    image: String
    categories: String
  }

  type digitalIncomeRoomSite {
    _id: String!
    name: String
    domain: String
    coverImage: Attachment
  }
`;

export const queries = `
  digitalIncomeRoomPagesMain(page: Int, perPage: Int, searchValue: String, siteId: String): digitalIncomeRoomPagesList
  digitalIncomeRoomPageDetail(_id: String!): digitalIncomeRoomPage

  digitalIncomeRoomContentTypes(siteId: String): [digitalIncomeRoomContentType]
  digitalIncomeRoomContentTypesMain(page: Int, perPage: Int, siteId: String): digitalIncomeRoomContentTypesList 
  digitalIncomeRoomContentTypeDetail(_id: String!): digitalIncomeRoomContentType 

  digitalIncomeRoomEntriesMain(contentTypeId: String! page: Int perPage: Int): digitalIncomeRoomEntriesList
  digitalIncomeRoomEntryDetail(_id: String!): digitalIncomeRoomEntry

  digitalIncomeRoomTemplates(page: Int, perPage: Int, searchValue: String): [digitalIncomeRoomTemplate]
  digitalIncomeRoomTemplatesTotalCount: Int
  digitalIncomeRoomTemplateDetail(_id: String!): digitalIncomeRoomTemplate

  digitalIncomeRoomSites(page: Int, perPage: Int, searchValue: String, fromSelect: Boolean): [digitalIncomeRoomSite]
  digitalIncomeRoomSitesTotalCount: Int
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
  digitalIncomeRoomPagesAdd(${params}): digitalIncomeRoomPage
  digitalIncomeRoomPagesEdit(_id: String!, ${params}): digitalIncomeRoomPage
  digitalIncomeRoomPagesRemove(_id: String!): JSON

  digitalIncomeRoomContentTypesAdd(${contentTypeParams}): digitalIncomeRoomContentType 
  digitalIncomeRoomContentTypesEdit(_id: String!, ${contentTypeParams}): digitalIncomeRoomContentType 
  digitalIncomeRoomContentTypesRemove(_id: String!): JSON

  digitalIncomeRoomEntriesAdd(contentTypeId: String! values: JSON): digitalIncomeRoomEntry
  digitalIncomeRoomEntriesEdit(_id: String!, contentTypeId: String! values: JSON): digitalIncomeRoomEntry
  digitalIncomeRoomEntriesRemove(_id: String!): JSON

  digitalIncomeRoomTemplatesAdd(name: String, html: String): digitalIncomeRoomTemplate 
  digitalIncomeRoomTemplatesUse(_id: String!, name: String!, coverImage: AttachmentInput): String
  digitalIncomeRoomTemplatesRemove(_id: String!): JSON
  
  digitalIncomeRoomSitesAdd(name: String domain: String): digitalIncomeRoomSite 
  digitalIncomeRoomSitesEdit(_id: String! name: String domain: String): digitalIncomeRoomSite 
  digitalIncomeRoomSitesRemove(_id: String!): JSON 
  digitalIncomeRoomSitesDuplicate(_id: String!): digitalIncomeRoomSite
`;
