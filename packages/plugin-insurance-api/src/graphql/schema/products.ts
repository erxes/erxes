export const types = `
type CompanyProductConfig {
    companyId: ID!
    specificPrice: Float
  }

  type RiskConfig {
    riskId: ID!
    risk: Risk
    coverage: Float
    coverageLimit: Float
  }

  input RiskConfigInput {
    riskId: ID!
    coverage: Float
    coverageLimit: Float
  }
  
  type InsuranceProduct @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: ID!
    name: String
    code: String
    price: Float
    description: String
  
    createdAt: Date
    updatedAt: Date
    lastModifiedBy: User
    companyProductConfigs: [CompanyProductConfig]
    riskConfigs: [RiskConfig]
    categoryId: ID

    category: InsuranceCategory

    customFieldsData: JSON
  }
  
  type InsuranceProductOfVendor @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: ID!
    name: String
    code: String
    price: Float
    description: String

    createdAt: Date
    updatedAt: Date
    riskConfigs: [RiskConfig]
    customFieldsData: JSON
  }
  
  type InsuranceProductList {
    list: [InsuranceProduct]
    totalCount: Int
  }
  
  input CompanyProductConfigInput {
    companyId: ID!
    specificPrice: Float
  }
`;

export const queries = `
    insuranceProducts(searchValue: String, page: Int, perPage: Int): [InsuranceProduct]
    insuranceProductList(
    page: Int
    perPage: Int
    sortField: String
    sortDirection: SortDirection
    searchValue: String
    ): InsuranceProductList
    insuranceProduct(_id: ID!): InsuranceProduct
    insuranceProductsOfVendor(categoryId:ID): [InsuranceProductOfVendor]
`;

export const mutations = `
    insuranceProductsAdd(
        name: String!
        code: String!
        description: String!
        price: Float!
        riskConfigs: [RiskConfigInput]
        categoryId: ID
        companyProductConfigs: [CompanyProductConfigInput]
        customFieldsData: JSON
    ): InsuranceProduct
    insuranceProductsEdit(
        _id: ID!
        name: String
        code: String
        description: String
        price: Float
      riskConfigs: [RiskConfigInput]
      categoryId: ID
        companyProductConfigs: [CompanyProductConfigInput]
        customFieldsData: JSON
    ): InsuranceProduct
    insuranceProductsRemove(_id: ID!): String
`;
