export const types = `
`;

export const queries = `
  integrationsGetAccounts(kind: String): JSON
  integrationsGetIntegrations(kind: String): JSON
  integrationsGetIntegrationDetail(erxesApiId: String): JSON 

  integrationsGetGmailEmail(accountId: String): JSON
  integrationsGetConfigs: JSON

`;

export const mutations = `
  integrationsAdd: JSON
  integrationsUpdateConfigs(configsMap: JSON!): JSON
`;