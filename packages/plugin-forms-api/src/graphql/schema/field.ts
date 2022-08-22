const fieldCommonFields = `
  description: String
  options: [String]
  type: String
  validation: String
  text: String
  content: String
  isRequired: Boolean
  order: Int
  associatedFieldId: String
  logicAction: String
  column: Int
  groupName: String
  pageNumber: Int
  code: String
  searchable: Boolean
  showInCard: Boolean
  isVisibleToCreate: Boolean
  productCategoryId: String
  field: String
  isDefinedByErxes: Boolean
`;

export const fieldsTypes = ({ products }) => `
  ${
    products
      ? `
      extend type Product @key(fields: "_id") {
        _id: String! @external
      }
      `
      : ''
  }

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type Logic {
    fieldId: String!
    logicOperator: String
    logicValue: JSON
  }

  type LocationOption {
    lat: Float
    lng: Float
    description: String
  }

  input LocationOptionInput {
    lat: Float
    lng: Float
    description: String
  }

  type ObjectListConfig {
    key: String
    label: String
    type: String
  }

  input objectListConfigInput {
    key: String
    label: String
    type: String
  }

  type Field @key(fields: "_id") {
    _id: String!
    contentType: String!
    contentTypeId: String
    name: String
    isVisible: Boolean
    isVisibleInDetail: Boolean
    canHide: Boolean
    groupId: String
    lastUpdatedUser: User
    lastUpdatedUserId: String
    associatedField: Field
    logics: [Logic]
    locationOptions: [LocationOption]
    objectListConfigs: [ObjectListConfig]
    ${
      products
        ? `
        products: [Product]
      `
        : ''
    }
   
    ${fieldCommonFields}
  }

  input OrderItem {
    _id: String!
    order: Int!
  }

  input LogicInput {
    fieldId: String
    tempFieldId: String
    logicOperator: String
    logicValue: JSON
  }

  input FieldItem {
    _id: String
    tempFieldId: String
    logics: [LogicInput]
    locationOptions: [LocationOptionInput]
    objectListConfigs: [objectListConfigInput]
    ${fieldCommonFields}
  }

  type ColumnConfigItem {
    name: String
    label: String
    order: Int
  }
`;

export const fieldsQueries = `
  fieldsGetTypes: [JSON]
  fields(contentType: String!, contentTypeId: String, isVisible: Boolean, searchable: Boolean, isVisibleToCreate: Boolean, pipelineId: String): [Field]
  fieldsCombinedByContentType(contentType: String!, usageType: String, excludedNames: [String], segmentId: String, config: JSON, onlyDates: Boolean): JSON
  fieldsDefaultColumnsConfig(contentType: String!): [ColumnConfigItem]
`;

const fieldsCommonFields = `
  type: String
  validation: String
  text: String
  description: String
  code: String
  options: [String]
  locationOptions: [LocationOptionInput]
  isRequired: Boolean
  order: Int
  groupId: String
  isVisible: Boolean
  canHide: Boolean
  associatedFieldId: String
  logic: LogicInput
  searchable: Boolean
  showInCard: Boolean
  objectListConfigs: [objectListConfigInput]
  isVisibleToCreate: Boolean
`;

export const fieldsMutations = `
  fieldsAdd(contentType: String!, contentTypeId: String, ${fieldsCommonFields}): Field
  fieldsBulkAddAndEdit(contentType: String!, contentTypeId: String, addingFields:[FieldItem], editingFields:[FieldItem]): [Field]
  fieldsEdit(_id: String!, ${fieldsCommonFields}): Field
  fieldsRemove(_id: String!): Field
  fieldsUpdateOrder(orders: [OrderItem]): [Field]
  fieldsUpdateVisible(_id: String!, isVisible: Boolean, isVisibleInDetail: Boolean) : Field
  fieldsUpdateSystemFields(_id: String!, isVisibleToCreate: Boolean, isRequired: Boolean) : Field
`;

export const fieldsGroupsTypes = `
  type FieldsGroup {
    _id: String!
    name: String
    contentType: String
    order: Int
    code: String
    description: String
    isVisible: Boolean
    isVisibleInDetail: Boolean
    isDefinedByErxes: Boolean
    fields: [Field]
    lastUpdatedUserId: String
    lastUpdatedUser: User
    config: JSON
  }
`;

const fieldsGroupsCommonFields = `
  name: String
  contentType: String
  order: Int
  description: String
  code: String
  isVisible: Boolean
  isVisibleInDetail: Boolean
  config: JSON
`;

export const fieldsGroupsQueries = `
  fieldsGroups(contentType: String, isDefinedByErxes: Boolean, config: JSON): [FieldsGroup]
  getSystemFieldsGroup(contentType: String): FieldsGroup
`;

export const fieldsGroupsMutations = `
  fieldsGroupsAdd(${fieldsGroupsCommonFields}): FieldsGroup
  fieldsGroupsEdit(_id: String!, ${fieldsGroupsCommonFields}): FieldsGroup
  fieldsGroupsRemove(_id: String!): JSON
  fieldsGroupsUpdateVisible(_id: String, isVisible: Boolean, isVisibleInDetail: Boolean) : FieldsGroup
  fieldsGroupsUpdateOrder(orders: [OrderItem]): [FieldsGroup]
`;
