export const types = `
  type UIOptions {
    colors: JSON
    logo: String
    bgImage: String
    favIcon: String
    receiptIcon: String
    texts: JSON
    kioskHeaderImage: String
    mobileAppImage: String
    qrCodeImage: String
  }

  type EbarimtConfig {
    companyName: String
    ebarimtUrl: String
    checkCompanyUrl: String
    hasVat: Boolean
    hasCitytax: Boolean
    districtCode: String
    companyRD: String
    defaultGSCode: String
    vatPercent: Int
    cityTaxPercent: Int
    footerText: String
    hasCopy: Boolean
  }

  type PoscCatProd {
    _id: String
    categoryId: String
    code: String
    name: String
    productId: String
  }

  type PosclientSlot {
    _id: String
    code: String
    name: String
  }

  type PosConfig {
    _id: String
    name: String
    description: String
    pdomain: String
    userId: String
    createdAt: Date
    productDetails: [String]
    adminIds: [String]
    cashierIds: [String]
    paymentIds: [String]
    paymentTypes: [JSON]
    beginNumber: String
    maxSkipNumber: Int
    waitingScreen: JSON
    kioskMachine: JSON
    kitchenScreen: JSON
    token: String
    erxesAppToken: String
    uiOptions: UIOptions
    ebarimtConfig: EbarimtConfig
    catProdMappings: [PoscCatProd]
    initialCategoryIds: [String]
    kioskExcludeCategoryIds: [String]
    kioskExcludeProductIds: [String]
    deliveryConfig: JSON
    branchId: String
    departmentId: String
    checkRemainder: Boolean
    permissionConfig: JSON
    allowTypes: [String]
  }
`;

export const mutations = `
  posConfigsFetch(token: String!): PosConfig
  syncConfig(type: String!): JSON
  syncOrders: JSON
  deleteOrders: JSON
  posChooseConfig(token: String!): String
`;

export const queries = `
  currentConfig: PosConfig
  getBranches: JSON
  poscSlots: [PosclientSlot]
  posclientConfigs: [PosConfig]
`;
