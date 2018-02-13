export const types = `
  type FieldsGroups {
    _id: String!
    name: String
    nestedUnder: String
    description: String
    order: Int
  }
`;

const commonFields = `
  name: String
  nestedUnder: String
  order: Int
  description: String
`;

export const queries = `
  fieldsgroups(contentType: String): [FieldsGroups]
`;

export const mutations = `
  fieldsGroupsAdd(${commonFields}): FieldsGroups
  fieldsGroupsEdit(_id: String!, ${commonFields}): FieldsGroups
  fieldsGroupsRemove(_id: String!): FieldsGroups
`;
