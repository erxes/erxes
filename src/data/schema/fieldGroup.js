export const types = `
type FieldsGroup {
    _id: String!
    name: String
    nestedUnder: String
    description: String
    order: Int
    getFields: [Field]
  }
`;

const commonFields = `
  name: String
  nestedUnder: String
  order: Int
  description: String
`;

export const queries = `
  fieldsgroups(contentType: String): [FieldsGroup]
`;

export const mutations = `
  fieldsGroupsAdd(${commonFields}): FieldsGroup
  fieldsGroupsEdit(_id: String!, ${commonFields}): FieldsGroup
  fieldsGroupsRemove(_id: String!): FieldsGroup
`;
