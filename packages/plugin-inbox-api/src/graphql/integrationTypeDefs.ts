export const types = `
  type Integration {
    _id: String!
    kind: String!
    name: String!
    brandId: String!
    languageCode: String
    code: String
    formId: String
    tagIds: [String]
    tags: [Tag]
    uiOptions: JSON
    isActive: Boolean
    webhookData: JSON

    brand: Brand
    channels: [Channel]

    healthStatus: JSON
  }

  type integrationsTotalCount {
    total: Int
    byTag: JSON
    byChannel: JSON
    byBrand: JSON
    byKind: JSON
    byStatus: JSON
  }

  type integrationsGetUsedTypes {
    _id: String
    name: String
  }
`;

export const queries = `
  integrations(
    page: Int,
    perPage: Int,
    kind: String,
    searchValue: String,
    channelId: String,
    brandId: String,
    tag: String,
    status: String,
    formLoadType: String,
    sortField: String
    sortDirection: Int
  ): [Integration]

  allLeadIntegrations: [Integration]

  integrationsGetUsedTypes: [integrationsGetUsedTypes]
  integrationGetLineWebhookUrl(_id: String!): String
  integrationDetail(_id: String!): Integration
  integrationsTotalCount(kind: String, brandId: String, tag: String, channelId: String, status: String, formLoadType: String): integrationsTotalCount
  integrationsFetchApi(path: String!, params: JSON!): JSON
`;

export const mutations = `
  integrationsRemove(_id: String!): JSON
  integrationsRemoveAccount(_id: String!): JSON

  integrationsArchive(_id: String!, status: Boolean!): Integration
  integrationsRepair(_id: String!): JSON

  integrationsUpdateConfigs(configsMap: JSON!): JSON
`;