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

export const mutations = `
  fieldsGroupsAdd(${commonFields}): Field
  fieldsGroupsEdit(_id: String!, ${commonFields}): Field
  fieldsGroupsRemove(_id: String!): Field
`;
