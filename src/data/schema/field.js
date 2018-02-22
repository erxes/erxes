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
    visible: Boolean
    isDefinedByErxes: Boolean
    groupId: String
    lastUpdatedBy: User
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

export const queries = `
  fields(contentType: String!, contentTypeId: String): [Field]
  fieldsCombinedByContentType(contentType: String!): JSON
  fieldsDefaultColumnsConfig(contentType: String!): [ColumnConfigItem]
`;

const commonFields = `
  type: String
  validation: String
  text: String
  description: String
  options: [String]
  isRequired: Boolean
  order: Int
  isDefinedByErxes: Boolean
  groupId: String
  visible: Boolean
  lastUpdatedBy: String
`;

export const mutations = `
  fieldsAdd(contentType: String!, contentTypeId: String, ${commonFields}): Field
  fieldsEdit(_id: String!, ${commonFields}): Field
  fieldsRemove(_id: String!): Field
  fieldsUpdateOrder(orders: [OrderItem]): [Field]
  fieldsUpdateOrderNumber(_id: String!, order: Int) : Field
  fieldsUpdateVisible(_id: String!, visible: Boolean, lastUpdatedBy: String) : Field
`;
