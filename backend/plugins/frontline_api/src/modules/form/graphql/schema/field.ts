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
  allowSearch: Boolean

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
  enum FieldValidatorType {
    PRESET
    CUSTOM
    NONE
  }

  enum FieldValidatorPresetKey {
    EMAIL
    PHONE
    POSTAL_CODE
    ALPHANUMERIC
    MN_VEHICLE_REGISTRATION
    NUMBER
    DATE
    DATE_TIME
  }

  type FieldValidator {
    type: FieldValidatorType!
    presetKey: FieldValidatorPresetKey
    customRegex: String
    errorMessage: String
  }

  input FieldValidatorInput {
    type: FieldValidatorType!
    presetKey: FieldValidatorPresetKey
    customRegex: String
    errorMessage: String
  }

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
    validator: FieldValidator
    relationType: String
    isDisabled: Boolean
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
    validator: FieldValidatorInput
    ${fieldCommonFields}
  }

  type FrontlineFieldListResponse {
    list: [FrontlineField],
    pageInfo: PageInfo
    totalCount: Int,
  }
`;

export const fieldsQueries = `
  frontlineFields(contentType: String!, contentTypeId: String, isVisible: Boolean, searchable: Boolean, isVisibleToCreate: Boolean,isDefinedByErxes:Boolean,isDisabled:Boolean): FrontlineFieldListResponse
`;

export const fieldsMutations = `
  frontlineFieldsBulkAction(contentType: String!, contentTypeId: String, newFields:[FrontlineFieldItem], updatedFields:[FrontlineFieldItem], removedFieldIds:[String]): [FrontlineField]
`;
