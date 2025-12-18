export const types = `
enum CustomerType {
 individual
  company
}

type RiskType {
  id: ID!
  name: String!
  description: String
  createdAt: Date!
  updatedAt: Date!
}

type AttributeDefinition {
  name: String!
  dataType: String!
  required: Boolean!
  description: String
  options: [String]
  min: Float
  max: Float
  subAttributes: [AttributeDefinition]
}

type InsuranceType {
  id: ID!
  name: String!
  attributes: [AttributeDefinition!]!
  createdAt: Date!
  updatedAt: Date!
}

type CoveredRisk {
  risk: RiskType!
  coveragePercentage: Int!
}

type InsuranceProduct {
  id: ID!
  name: String!
  insuranceType: InsuranceType!
  coveredRisks: [CoveredRisk!]!
  pricingConfig: JSON!
  createdAt: Date!
  updatedAt: Date!
}

type InsuranceVendorProduct {
  product: InsuranceProduct!
  pricingOverride: JSON
}

type InsuranceVendor {
  id: ID!
  name: String!
  offeredProducts: [InsuranceVendorProduct!]!
  createdAt: Date!
  updatedAt: Date!
}

type InsuranceVendorUser {
  id: ID!
  username: String!
  vendor: InsuranceVendor!
  role: String! 
  createdAt: Date!
  updatedAt: Date!
}

type InsuranceCustomer {
  id: ID!
  firstName: String!
  lastName: String!
  type: CustomerType!
  registrationNumber: String!
  email: String
  phone: String
  companyName: String
  createdAt: Date!
  updatedAt: Date!
}

type InsuranceContract {
  id: ID!
  vendor: InsuranceVendor!
  customer: InsuranceCustomer!
  insuranceType: InsuranceType!
  insuranceProduct: InsuranceProduct!
  coveredRisks: [CoveredRisk!]!
  chargedAmount: Float!
  startDate: Date!
  endDate: Date!
  insuredObject: JSON!
  createdAt: Date!
  updatedAt: Date!
}
`;

export const inputs = `
  input AttributeInput {
    name: String!
    dataType: String!
    required: Boolean
    description: String
    options: [String]
    min: Float
    max: Float
    subAttributes: [AttributeInput]
  }

  input InsuranceCustomerInput {
    firstName: String!
    lastName: String!
    type: CustomerType!
    registrationNumber: String!
    email: String
    phone: String
    companyName: String
  }

  input InsuranceContractInput {
    vendorId: ID!
    customerId: ID!
    insuranceTypeId: ID!
    insuranceProductId: ID!
    coveredRisks: [CoveredRiskInput!]!
    chargedAmount: Float!
    startDate: Date!
    endDate: Date!
    insuredObject: JSON!
  }

  input CoveredRiskInput {
    riskId: ID!
    coveragePercentage: Int!
  } 
`;

export const queries = `
  riskTypes: [RiskType!]!
  riskType(id: ID!): RiskType


  insuranceTypes: [InsuranceType!]!
  insuranceType(id: ID!): InsuranceType


  insuranceProducts: [InsuranceProduct!]!
  insuranceProduct(id: ID!): InsuranceProduct
  productsByType(typeId: ID!): [InsuranceProduct!]!


  vendors: [InsuranceVendor!]!
  vendor(id: ID!): InsuranceVendor

  myVendor: InsuranceVendor

  customers(vendorId: ID): [InsuranceCustomer!]!
  customer(id: ID!): InsuranceCustomer

  contracts(vendorId: ID, customerId: ID): [InsuranceContract!]!
  contract(id: ID!): InsuranceContract
`;

export const mutations = `
  createInsuranceType(name: String!, attributes: [AttributeInput!]): InsuranceType!
  updateInsuranceType(id: ID!, name: String, attributes: [AttributeInput!]): InsuranceType!
  deleteInsuranceType(id: ID!): Boolean!

  createInsuranceProduct(
    name: String!
    insuranceTypeId: ID!
    coveredRisks: [CoveredRiskInput!]!
    pricingConfig: JSON!
  ): InsuranceProduct!
  updateInsuranceProduct(
    id: ID!
    name: String
    coveredRisks: [CoveredRiskInput!]
    pricingConfig: JSON
  ): InsuranceProduct!


  addProductToVendor(vendorId: ID!, productId: ID!, pricingOverride: JSON): InsuranceVendor!
  removeProductFromVendor(vendorId: ID!, productId: ID!): InsuranceVendor!


  createCustomer(name: String!, type: String!, details: JSON!): InsuranceCustomer!
  updateCustomer(id: ID!, name: String, details: JSON): InsuranceCustomer!


  createInsuranceContract(
    vendorId: ID!
    customerId: ID!
    productId: ID!
    insuredObject: JSON!
    startDate: Date!
    endDate: Date!
  ): InsuranceContract!


  createVendorUser(username: String!, password: String!, vendorId: ID!, role: String): InsuranceVendorUser!

  createRiskType(name: String!, description: String): RiskType!
  updateRiskType(id: ID!, name: String, description: String): RiskType!
  deleteRiskType(id: ID!): Boolean!
`;
