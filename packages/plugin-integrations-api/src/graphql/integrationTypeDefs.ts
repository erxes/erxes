export const types = `
`;

export const queries = `
  integrationsGetAccounts(kind: String): JSON
  integrationsGetIntegrations(erxesApiId: String): JSON
  integrationsGetIntegrationDetail(accountId: String): JSON 

  integrationsGetGmailEmail(accountId: String): JSON
  integrationsGetConfigs: JSON

`;

export const mutations = `
  integrationsAdd: JSON
  integrationsUpdateConfigs(configsMap: JSON!): JSON
`;