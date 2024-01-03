export const types = `
  type ClientPortalFieldConfig {
    fieldId: String,
    allowedClientPortalIds: [String],
    requiredOn: [String]
  }
`;

export const queries = `
    clientPortalFieldConfig(fieldId: String): ClientPortalFieldConfig
`;

export const mutations = `
    clientPortalFieldConfigsEdit(fieldId: String!, allowedClientPortalIds: [String], requiredOn: [String]): ClientPortalFieldConfig
    clientPortalFieldConfigsRemove(fieldId: String!): ClientPortalFieldConfig
`;
