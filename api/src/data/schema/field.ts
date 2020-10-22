export const fieldsTypes = `
  type Field {
    _id: String!
    contentType: String!
    contentTypeId: String
    type: String
    validation: String
    text: String
    name: String
    description: String
    options: [String]
    isRequired: Boolean
    order: Int
    isVisible: Boolean
    isDefinedByErxes: Boolean
    groupId: String
    lastUpdatedUser: User
    lastUpdatedUserId: String
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

export const fieldsQueries = `
  fields(contentType: String!, contentTypeId: String): [Field]
  fieldsCombinedByContentType(contentType: String!, usageType: String, excludedNames: [String]): JSON
  fieldsDefaultColumnsConfig(contentType: String!): [ColumnConfigItem]
`;

const fieldsCommonFields = `
  type: String
  validation: String
  text: String
  description: String
  options: [String]
  isRequired: Boolean
  order: Int
  groupId: String
  isVisible: Boolean
`;

export const fieldsMutations = `
  fieldsAdd(contentType: String!, contentTypeId: String, ${fieldsCommonFields}): Field
  fieldsEdit(_id: String!, ${fieldsCommonFields}): Field
  fieldsRemove(_id: String!): Field
  fieldsUpdateOrder(orders: [OrderItem]): [Field]
  fieldsUpdateVisible(_id: String!, isVisible: Boolean) : Field
`;

export const fieldsGroupsTypes = `
  type FieldsGroup {
    _id: String!
    name: String
    contentType: String
    order: Int
    description: String
    isVisible: Boolean
    isDefinedByErxes: Boolean
    fields: [Field]
    lastUpdatedUserId: String
    lastUpdatedUser: User
  }
`;

const fieldsGroupsCommonFields = `
  name: String
  contentType: String
  order: Int
  description: String
  isVisible: Boolean
`;

export const fieldsGroupsQueries = `
  fieldsGroups(contentType: String): [FieldsGroup]
`;

export const fieldsGroupsMutations = `
  fieldsGroupsAdd(${fieldsGroupsCommonFields}): FieldsGroup
  fieldsGroupsEdit(_id: String!, ${fieldsGroupsCommonFields}): FieldsGroup
  fieldsGroupsRemove(_id: String!): JSON
  fieldsGroupsUpdateVisible(_id: String, isVisible: Boolean) : FieldsGroup
`;
