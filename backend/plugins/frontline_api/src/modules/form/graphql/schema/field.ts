const fieldCommonFields = `
  description: String
  options: [String]
  type: String
  validation: String
  regexValidation: String
  text: String
  content: String
  isRequired: Boolean
  order: Int
  associatedFieldId: String
  logicAction: String

  column: Int
  pageNumber: Int
  code: String
  searchable: Boolean
  showInCard: Boolean
  isVisibleToCreate: Boolean
  productCategoryId: String
  field: String
  isDefinedByErxes: Boolean
`;

export const fieldsTypes = `
  type FrontlineLogic {
    fieldId: String!
    logicOperator: String
    logicValue: JSON
  }

  type FrontlineLocationOption {
    lat: Float
    lng: Float
    description: String
  }

  input FrontlineLocationOptionInput {
    lat: Float
    lng: Float
    description: String
  }

  type FrontlineObjectListConfig {
    key: String
    label: String
    type: String
  }

  input FrontlineObjectListConfigInput {
    key: String
    label: String
    type: String
  }

  type FrontlineField{
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
    associatedField: FrontlineField
    locationOptions: [FrontlineLocationOption]
    objectListConfigs: [FrontlineObjectListConfig]
    optionsValues: String
    subFieldIds: [String]
    subFields: [FrontlineField]
    logics: [FrontlineLogic]

    ${fieldCommonFields}
    relationType: String
    isDisabled: Boolean
  }

  input FrontlineOrderItem {
    _id: String!
    order: Int!
  }

  input FrontlineLogicInput {
    fieldId: String
    tempFieldId: String
    logicOperator: String
    logicValue: JSON
  }

  input FrontlineFieldItem {
    _id: String
    tempFieldId: String
    logics: [FrontlineLogicInput]
    locationOptions: [FrontlineLocationOptionInput]
    objectListConfigs: [FrontlineObjectListConfigInput]
    optionsValues: String
    subFieldIds: [String]
    ${fieldCommonFields}
  }

  type FrontlineColumnConfigItem {
    name: String
    label: String
    order: Int
  }

  type FrontlineFieldListResponse {
    list: [FrontlineField],
    pageInfo: PageInfo
    totalCount: Int,
  }
`;

export const fieldsQueries = `
  frontlineFieldsGetTypes: [JSON]
  frontlineGetFieldsInputTypes:[JSON]
  frontlineFields(contentType: String!, contentTypeId: String, isVisible: Boolean, searchable: Boolean, isVisibleToCreate: Boolean,isDefinedByErxes:Boolean,isDisabled:Boolean): FrontlineFieldListResponse
  frontlineFieldsCombinedByContentType(contentType: String!, usageType: String, excludedNames: [String], segmentId: String, config: JSON, onlyDates: Boolean): JSON
  frontlineFieldsDefaultColumnsConfig(contentType: String!): [FrontlineColumnConfigItem]
  frontlineFieldsGetRelations(contentType: String!, isVisibleToCreate: Boolean, isVisible: Boolean): [FrontlineField]
  frontlineFieldByCode(contentType: String!, code: String): FrontlineField
`;

const fieldsCommonFields = `
  type: String
  validation: String
  regexValidation: String
  text: String
  description: String
  code: String
  options: [String]
  locationOptions: [FrontlineLocationOptionInput]
  isRequired: Boolean
  order: Int
  groupId: String
  isVisible: Boolean
  canHide: Boolean
  associatedFieldId: String
  logicAction: String
  logics: [FrontlineLogicInput]
  searchable: Boolean
  showInCard: Boolean
  objectListConfigs: [FrontlineObjectListConfigInput]
  isVisibleToCreate: Boolean
`;

export const fieldsMutations = `
  frontlineFieldsAdd(contentType: String!, contentTypeId: String, ${fieldsCommonFields}): FrontlineField
  frontlineFieldsBulkAction(contentType: String!, contentTypeId: String, newFields:[FrontlineFieldItem], updatedFields:[FrontlineFieldItem]): [FrontlineField]
  frontlineFieldsEdit(_id: String!, ${fieldsCommonFields}): FrontlineField
  frontlineFieldsRemove(_id: String!): FrontlineField
  frontlineFieldsUpdateOrder(orders: [FrontlineOrderItem]): [FrontlineField]
  frontlineFieldsUpdateVisible(_id: String!, isVisible: Boolean, isVisibleInDetail: Boolean) : FrontlineField
  frontlineFieldsUpdateSystemFields(_id: String!, isVisibleToCreate: Boolean, isRequired: Boolean) : FrontlineField
`;
