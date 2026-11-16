export const types = `
  type FixedAssetChooserOwner {
    ownerId: String!
    code: String!
    count: Float!
  }
  type FixedAssetChooserLocation {
    branchId: String!
    departmentId: String!
    remainder: Float!
    owners: [FixedAssetChooserOwner!]!
  }
  type FixedAssetChooserItem {
    asset: FixedAsset!
    locations: [FixedAssetChooserLocation!]!
    unlocatedOwners: [FixedAssetChooserOwner!]!
  }
  type FixedAssetChooserPage {
    items: [FixedAssetChooserItem!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type FixedAssetCapitalLocation {
    branchId: String!
    departmentId: String!
    count: Float!
    deferredTaxAsset: Float
    deferredTaxLiability: Float
  }

  type FixedAssetCapitalValuation {
    fixedAssetId: String!
    accountId: String!
    depreciationAccountId: String!
    count: Float!
    originalCost: Float!
    preDeprecation: Float!
    taxPreDeprecation: Float
    hasTaxDepreciation: Boolean
    incomeTaxRate: Float
    revaluationLoss: Float!
    revaluationReserve: Float!
    taxDepreciationMethod: String
    taxAnnualDepreciationRate: Float
    taxSalvageValue: Float
    annualDepreciationRate: Float!
    depreciationMethod: String!
    salvageValue: Float!
    depreciationStartDate: Date!
    depreciationThrough: Date
    ready: Boolean!
    locations: [FixedAssetCapitalLocation!]!
  }

  type FixedAssetLocationRemainder {
    fixedAssetId: String
    branchId: String
    departmentId: String
    remainder: Float
  }

  type FixedAsset @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    code: String
    name: String
    categoryId: String
    description: String
    status: String

    accountId: String
    count: Float
    currentCount: Float
    originalCost: Float
    accumulatedDepreciation: Float
    bookValue: Float
    acquisitionDate: Date
    depreciationStartDate: Date
    transactionId: String
    transactionDetailId: String
    depreciationMethod: String
    annualDepreciationRate: Float
    salvageValue: Float
    taxDepreciationMethod: String
    taxAnnualDepreciationRate: Float
    taxSalvageValue: Float
    propertiesData: JSON

    createdAt: Date
    updatedAt: Date
    createdBy: String
    modifiedBy: String
  }
`;

export const queries = `
  accountingFixedAssetChooser(journal: String!, date: Date!, searchValue: String, categoryId: String, branchId: String, departmentId: String, ownerId: String, excludeTransactionId: String, page: Int, perPage: Int): FixedAssetChooserPage!

  fixedAssets(searchValue: String, ids: [String], categoryId: String, status: String, limit: Int, date: Date, excludeTransactionId: String): [FixedAsset]
  fixedAssetDetail(_id: String!): FixedAsset
  fixedAssetCapitalValuation(fixedAssetId: String!, date: Date!, excludeTransactionId: String, journal: String): FixedAssetCapitalValuation!
  fixedAssetLocationRemainder(fixedAssetId: String!, branchId: String, departmentId: String, date: Date, excludeTransactionId: String): FixedAssetLocationRemainder
  fixedAssetLocationRemainders(searchValue: String, fixedAssetId: String, categoryId: String, branchId: String, departmentId: String, date: Date, limit: Int): [FixedAssetLocationRemainder]
`;

export const mutations = `
  fixedAssetsAdd(
    code: String!
    name: String!
    categoryId: String!
    description: String
    status: String
    propertiesData: JSON
  ): FixedAsset

  fixedAssetsEdit(
    _id: String!
    code: String!
    name: String!
    categoryId: String!
    description: String
    status: String
    propertiesData: JSON
  ): FixedAsset

  fixedAssetsRemove(_id: String!): JSON
`;
