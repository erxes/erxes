export const types = `
  type MastraProvider {
    _id: String
    provider: String
    label: String
    apiKey: String
    baseUrl: String
    isDefault: Boolean
    isEnabled: Boolean
    isOpenAICompatible: Boolean
    modelsEndpoint: String
    envKey: String
    headers: JSON
    createdAt: Date
  }

  input MastraProviderInput {
    provider: String!
    label: String
    apiKey: String
    baseUrl: String
    isDefault: Boolean
    isEnabled: Boolean
    isOpenAICompatible: Boolean
    modelsEndpoint: String
    envKey: String
    headers: JSON
  }

  type MastraProviderModel {
    id: String
    name: String
  }

  type MastraProviderCatalogEntry {
    provider: String
    label: String
    isOpenAICompatible: Boolean
    isConfigured: Boolean
  }

  type MastraProviderPreset {
    provider: String
    label: String
    isOpenAICompatible: Boolean
    envKey: String
    baseUrl: String
    modelsEndpoint: String
    headers: JSON
  }
`;

export const queries = `
  mastraProviders: [MastraProvider]
  mastraProvider(_id: String!): MastraProvider
  mastraProviderCatalog: [MastraProviderCatalogEntry]
  mastraProviderModels(provider: String!): [MastraProviderModel]
  mastraProviderPresets: [MastraProviderPreset]
`;

export const mutations = `
  mastraProviderSave(doc: MastraProviderInput!): MastraProvider
  mastraProviderRemove(_id: String!): JSON
`;
