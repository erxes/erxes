export const types = `
  extend type Customer @key(fields: "_id") {
    _id: String! @external
  }
`;

export const queries = `
  integrationsGetAccounts(kind: String): JSON
  integrationsGetIntegrations(kind: String): JSON
  integrationsGetIntegrationDetail(erxesApiId: String): JSON
  integrationsGetConfigs: JSON
`;

export const mutations = `
  integrationsUpdateConfigs(configsMap: JSON!): JSON

`;
