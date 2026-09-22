export const types = `
  type PropertySystemField {
    code: String!
    name: String!
    type: String!
    isVisible: Boolean!
    isVisibleToCreate: Boolean!
    isRequired: Boolean!
    logics: JSON
  }

  input PropertySystemFieldLogicInput {
    field: String!
    operator: String!
    value: String
    action: String!
  }
`;

export const queries = `
  propertySystemFields(contentType: String!): [PropertySystemField!]!
`;

export const mutations = `
  propertySystemFieldEdit(
    contentType: String!
    code: String!
    isVisible: Boolean
    isVisibleToCreate: Boolean
    isRequired: Boolean
    logics: [PropertySystemFieldLogicInput!]
  ): PropertySystemField!
`;
