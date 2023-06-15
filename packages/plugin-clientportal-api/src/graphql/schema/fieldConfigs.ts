export const types = `
  type ClientPortalFieldConfig {
    fieldId: ID!,
    allowedClientPortalIds: [String],
    requiredOn: [String]
  }
`;

export const queries = `
    clientPortalFieldConfig(fieldId: ID): ClientPortalFieldConfig
`;

export const mutations = `
    clientPortalFieldConfigsEdit(fieldId: ID!, allowedClientPortalIds: [String], requiredOn: [String]): ClientPortalFieldConfig
    clientPortalFieldConfigsRemove(fieldId: ID!): ClientPortalFieldConfig
`;
