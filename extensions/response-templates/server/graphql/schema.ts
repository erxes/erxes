export const types = `
  type ResponseTemplate {
    _id: String!
    name: String!
    content: String!
    channelId: String!
    files: [String!]!
    createdBy: String
    sourceId: String
    createdAt: Date
    updatedAt: Date
  }

  type ResponseTemplateList {
    list: [ResponseTemplate!]!
    totalCount: Int!
  }

  type ResponseTemplateChannel {
    _id: String!
    name: String!
  }

  type ResponseTemplateImport {
    imported: Int!
    nextCursor: String
  }
`;

export const queries = `
  responseTemplatesList(
    channelId: String
    searchValue: String
    page: Int
    perPage: Int
  ): ResponseTemplateList!
  responseTemplatesDetail(_id: String!): ResponseTemplate!
  responseTemplatesChannels: [ResponseTemplateChannel!]!
  responseTemplatesComposerChannel(
    contentType: String!
    contentId: String!
  ): String
`;

export const mutations = `
  responseTemplatesAdd(
    name: String!
    content: String!
    channelId: String!
  ): ResponseTemplate!
  responseTemplatesEdit(
    _id: String!
    name: String!
    content: String!
    channelId: String!
  ): ResponseTemplate!
  responseTemplatesRemove(_id: String!): ResponseTemplate!
  responseTemplatesImportFromFrontline(cursor: String): ResponseTemplateImport!
`;
