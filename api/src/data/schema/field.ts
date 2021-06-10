const fieldCommonFields = `
  description: String
  options: [String]
  hasCustomOptions: Boolean
  type: String
  validation: String
  text: String
  content: String
  isRequired: Boolean
  order: Int
  associatedFieldId: String
  logicAction: String
  column: String
  groupName: String
  pageNumber: Int
  stageId: String
`;

const commonLogicTypes = `
  fieldId: String!
  logicOperator: String
  logicValue: JSON
  logicAction: String
`;

export const fieldsTypes = `
  type Logic {
    ${commonLogicTypes}
  }

  type Action {
    ${commonLogicTypes}
    tagIds: [String]
    stageId: String
    pipelineId: String
    boardId: String
    itemName: String
    itemId: String
  }

  type Field {
    _id: String!
    contentType: String!
    contentTypeId: String
    name: String
    isVisible: Boolean
    isVisibleInDetail: Boolean
    canHide: Boolean
    isDefinedByErxes: Boolean
    groupId: String
    lastUpdatedUser: User
    lastUpdatedUserId: String
    associatedField: Field
    logics: [Logic]
    actions: [Action]
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
    logicAction: String!
  }

  input ActionInput {
    fieldId: String
    tempFieldId: String
    logicOperator: String
    logicValue: JSON
    logicAction: String!
    tagIds: [String]
    itemId: String
    itemName: String
    stageId: String
    pipelineId: String
    boardId: String
  }
  

  input FieldItem {
    _id: String
    tempFieldId: String
    logics: [LogicInput]
    actions: [ActionInput]
    ${fieldCommonFields}
  }

  type ColumnConfigItem {
    name: String
    label: String
    order: Int
  }

  type FieldsInbox {
    customer: [Field]
    conversation: [Field]
    device: [Field]
  }
`;

export const fieldsQueries = `
  fields(contentType: String!, contentTypeId: String, isVisible: Boolean, boardId: String, pipelineId: String): [Field]
  fieldsCombinedByContentType(contentType: String!, usageType: String, excludedNames: [String], segmentId: String, pipelineId: String): JSON
  fieldsDefaultColumnsConfig(contentType: String!): [ColumnConfigItem]
  fieldsInbox: FieldsInbox
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
  canHide: Boolean
  associatedFieldId: String
  logic: LogicInput
`;

export const fieldsMutations = `
  fieldsAdd(contentType: String!, contentTypeId: String, ${fieldsCommonFields}): Field
  fieldsBulkAddAndEdit(contentType: String!, contentTypeId: String, addingFields:[FieldItem], editingFields:[FieldItem]): [Field]
  fieldsEdit(_id: String!, ${fieldsCommonFields}): Field
  fieldsRemove(_id: String!): Field
  fieldsUpdateOrder(orders: [OrderItem]): [Field]
  fieldsUpdateVisible(_id: String!, isVisible: Boolean, isVisibleInDetail: Boolean) : Field
`;

const BoardsPipelinesFields = `
  boardId: String
  pipelineIds : [String]
`;

export const fieldsGroupsTypes = `
  type BoardsPipelines {
    ${BoardsPipelinesFields}
  }

  input BoardsPipelinesInput {
    ${BoardsPipelinesFields}
  }

  type FieldsGroup {
    _id: String!
    name: String
    contentType: String
    order: Int
    description: String
    isVisible: Boolean
    isVisibleInDetail: Boolean
    isDefinedByErxes: Boolean
    fields: [Field]
    lastUpdatedUserId: String
    lastUpdatedUser: User
    boardsPipelines: [BoardsPipelines]
  }
`;

const fieldsGroupsCommonFields = `
  name: String
  contentType: String
  order: Int
  description: String
  isVisible: Boolean
  isVisibleInDetail: Boolean
  boardsPipelines: [BoardsPipelinesInput]
`;

export const fieldsGroupsQueries = `
  fieldsGroups(contentType: String, boardId: String, pipelineId: String): [FieldsGroup]
  getSystemFieldsGroup(contentType: String): FieldsGroup
`;

export const fieldsGroupsMutations = `
  fieldsGroupsAdd(${fieldsGroupsCommonFields}): FieldsGroup
  fieldsGroupsEdit(_id: String!, ${fieldsGroupsCommonFields}): FieldsGroup
  fieldsGroupsRemove(_id: String!): JSON
  fieldsGroupsUpdateVisible(_id: String, isVisible: Boolean, isVisibleInDetail: Boolean) : FieldsGroup
  fieldsGroupsUpdateOrder(orders: [OrderItem]): [FieldsGroup]
`;
