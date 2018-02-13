export const types = `
  type Field {
    _id: String!
    contentType: String!
    contentTypeId: String
    type: String
    validation: String
    text: String
    description: String
    options: [String]
    isRequired: Boolean
    order: Int
  }

  input OrderItem {
    _id: String!
    order: Int!
  }

  type ColumnConfigItem {
    name: String
    label: String
    order: Int
  }
`;
// type FieldsGroups {
//   _id: String!
//   name: String
//   contentType: String
//   description: String
//   order: Number
//   visible: Boolean
// }
export const queries = `
  fields(contentType: String!, contentTypeId: String): [Field]
  fieldsCombinedByContentType(contentType: String!): JSON
  fieldsDefaultColumnsConfig(contentType: String!): [ColumnConfigItem]
  fieldsByGroup(visible: Boolean, contentType: String!): [FieldsGroups]
`;

const commonFields = `
  type: String
  validation: String
  text: String
  description: String
  options: [String]
  isRequired: Boolean
  order: Int
`;

export const mutations = `
  fieldsAdd(contentType: String!, contentTypeId: String, ${commonFields}): Field
  fieldsEdit(_id: String!, ${commonFields}): Field
  fieldsRemove(_id: String!): Field
  fieldsUpdateOrder(orders: [OrderItem]): [Field]
`;
