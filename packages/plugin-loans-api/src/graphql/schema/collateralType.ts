export const types = () => `
  type CollateralTypeConfig {
    minPercent: Float,
    maxPercent: Float,
    defaultPercent: Float,
    riskClosePercent: Float,
    collateralType: String,
  }

  type CollateralProperty {
    sizeSquare: Boolean,
    sizeSquareUnit: Boolean,
    cntRoom: Boolean,
    startDate: Boolean,
    endDate: Boolean,
    quality: Boolean,
    purpose: Boolean,
    mark: Boolean,
    color: Boolean,
    power: Boolean,
    frameNumber: Boolean,
    importedDate: Boolean,
    factoryDate: Boolean,
    courtOrderDate: Boolean,
    mrtConfirmedDate: Boolean,
    cmrtRegisteredDate: Boolean,
    mrtRegisteredDate: Boolean,
    courtOrderNo: Boolean,
    mrtOrg: Boolean,
    registeredToAuthority: Boolean,
    causeToShiftTo: Boolean,
  }

  type CollateralType {
    _id: String,
    code: String,
    name: String,
    description: String,
    type: String,
    startDate: Date,
    endDate: Date,
    status: String,
    currency: String,
    config: CollateralTypeConfig,
    property: CollateralProperty,
  }

  type CollateralTypeListResponse {
    list: [CollateralType],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  categoryId: String
  productIds: [String]
  ids: [String]
  searchValue: String
  sortField: String
  sortDirection: Int
  conformityMainType: String
  conformityMainTypeId: String
  conformityRelType: String
  conformityIsRelated: Boolean
  conformityIsSaved: Boolean
`;

export const queries = `
  collateralTypesMain(${queryParams}): CollateralTypeListResponse
  collateralTypes(${queryParams}): [CollateralType]
  collateralTypeDetail(_id: String!): CollateralType
`;

const commonFields = `
  code: String,
  name: String,
  description: String,
  type: String,
  startDate: Date,
  endDate: Date,
  status: String,
  currency: String,
  config: JSON,
  property: JSON,
`;

export const mutations = `
  collateralTypeAdd(${commonFields}): CollateralType
  collateralTypeEdit(_id: String!, ${commonFields}): CollateralType
  collateralTypeRemove(_id: String!): CollateralType
`;
