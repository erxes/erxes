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
  }

  type QPayConfig {
    url: String
    callbackUrl: String
    username: String
    password: String
    invoiceCode: String
  }

  type CatProd {
    _id: String
    categoryId: String
    productId: String
  }

  type Config {
    _id: String
    name: String
    description: String
    userId: String
    createdAt: Date
    integrationId: String
    productDetails: [String]
    adminIds: [String]
    cashierIds: [String]
    beginNumber: String
    maxSkipNumber: Int
    waitingScreen: JSON
    kioskMachine: JSON
    kitchenScreen: JSON
    formSectionTitle: String
    formIntegrationIds: [String]
    brandId: String
    token: String
    uiOptions: UIOptions
    ebarimtConfig: EbarimtConfig
    qpayConfig: QPayConfig
    syncInfo: JSON
    catProdMappings: [CatProd]
    initialCategoryIds: [String]
    kioskExcludeProductIds: [String]
  }
`;

export const mutations = `
  posConfigsFetch(token: String!): Config
  syncConfig(type: String!): JSON
  syncOrders: JSON
  deleteOrders: JSON
`;

export const queries = `
  currentConfig: Config
  getBranches: JSON
`;
