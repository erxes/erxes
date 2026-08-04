export const queries = `
  recordReferenceFields(type: String!): JSON
  recordReferenceResolvePlaceholders(targetType: String!, targetId: String, value: JSON, fallback: JSON, alias: String): JSON
`;
