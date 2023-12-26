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

  type TravelProductConfig {
    duration: Int
    prices: JSON
  }

  input TravelProductConfigInput {
    duration: Int
    prices: JSON
  }

  type TravelDestination {
    _id: ID!
    name: String
    code: String
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

    travelProductConfigs: [TravelProductConfig]
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
    insuranceProducts(searchValue: String, page: Int, perPage: Int, categoryId: ID): [InsuranceProduct]
    insuranceProductList(
    page: Int
    perPage: Int
    sortField: String
    sortDirection: SortDirection
    searchValue: String
    categoryId: ID
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
        travelProductConfigs: [TravelProductConfigInput]
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
        travelProductConfigs: [TravelProductConfigInput]
    ): InsuranceProduct
    insuranceProductsRemove(_id: ID!): String

    insuranceDestinationAdd(
        name: String!
        code: String!
    ): TravelDestination

    insuranceDestinationEdit(
        _id: ID!
        name: String
        code: String
    ): TravelDestination

    insuranceDestinationRemove(_id: ID!): String
`;
