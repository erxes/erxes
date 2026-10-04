export const types = `
  type PropertySystemField {
    code: String!
    name: String!
    type: String!
    isVisible: Boolean!
    isVisibleToCreate: Boolean!
    isRequired: Boolean!
    logics: JSON
    requiredGroup: String
    alwaysFilled: Boolean
    notOnCreate: Boolean
    outsideLayout: Boolean
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
  propertySystemFieldsLayout(contentType: String!): [[String!]!]
`;

export const mutations = `
  propertySystemFieldsLayoutSave(
    contentType: String!
    layout: [[String!]!]
  ): [[String!]!]!
  propertySystemFieldEdit(
    contentType: String!
    code: String!
    isVisible: Boolean
    isVisibleToCreate: Boolean
    isRequired: Boolean
    logics: [PropertySystemFieldLogicInput!]
  ): PropertySystemField!
`;
