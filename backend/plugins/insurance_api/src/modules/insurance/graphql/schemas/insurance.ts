export const types = `
  enum Sort {
    ASC
    DESC
  }

  enum SortDirection {
    ASC
    DESC
  }

  enum CustomerType {
    individual
    company
  }

  """
  Аттрибут
  """
  type Attribute {
    name: String!
    dataType: String!
    required: Boolean
    description: String
    options: [String]
    min: Float
    max: Float
    subAttributes: [Attribute]
  }

  """
  Эрсдлийн төрөл
  """
  type RiskType {
    id: ID!
    name: String!
    description: String
    createdAt: Date!
    updatedAt: Date!
  }

  """
  Даатгалын төрөл
  """
  type InsuranceType {
    id: ID!
    name: String!
    attributes: [Attribute!]!
    createdAt: Date!
    updatedAt: Date!
  }

  """
  эрсдлийн хамгаалах хувь тохиргоо
  """
  type CoveredRisk {
    risk: RiskType!
    coveragePercentage: Int!
  }

  """
  Даатгалын бүтээгдэхүүн
  """
  type InsuranceProduct {
    id: ID!
    name: String!
    insuranceType: InsuranceType!
    coveredRisks: [CoveredRisk!]!
    pricingConfig: JSON!
    pdfContent: String
    templateId: ID
    createdAt: Date!
    updatedAt: Date!
  }

  """
  Даатгалын нийлүүлэгчийн бүтээгдэхүүн
  """
  type InsuranceVendorProduct {
    product: InsuranceProduct!
    pricingOverride: JSON
  }

  """
  Даатгалын нийлүүлэгч
  """
  type InsuranceVendor {
    id: ID!
    name: String!
    offeredProducts: [InsuranceVendorProduct!]!
    createdAt: Date!
    updatedAt: Date!
  }

  """
  vendor user профайл
  """
  type InsuranceVendorUser {
    id: ID!
    name: String
    email: String!
    phone: String
    vendor: InsuranceVendor!
    role: String!
    createdAt: Date!
    updatedAt: Date!
  }

  """
  даатгуулагч
  """
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

  """
  Даатгалын гэрээ
  """
  type InsuranceContract {
    id: ID!
    contractNumber: String!
    vendor: InsuranceVendor!
    customer: InsuranceCustomer!
    insuranceType: InsuranceType!
    insuranceProduct: InsuranceProduct!
    coveredRisks: [CoveredRisk!]!
    chargedAmount: Float!
    startDate: Date!
    endDate: Date!
    insuredObject: JSON!
    paymentKind: String!
    paymentStatus: String!
    pdfContent: String
    createdAt: Date!
    updatedAt: Date!
  }

  type ContractTemplate {
    id: ID!
    name: String!
    description: String
    htmlContent: String!
    cssContent: String
    version: Int!
    status: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type ContractPDFResult {
    success: Boolean!
    base64: String
    filename: String
  }
  
  type DeleteResult {
    success: Boolean!
  }

  type VendorUserLoginResponse {
    token: String!
    refreshToken: String!
    user: InsuranceVendorUser!
  }

  type InsuranceContractList {
    list: [InsuranceContract!]!
    totalCount: Int!
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

  vendorUsers(vendorId: ID): [InsuranceVendorUser!]!
  vendorUser(id: ID!): InsuranceVendorUser
  currentVendorUser: InsuranceVendorUser

  insuranceCustomers(search: String, page: Int, limit: Int, sort: Sort, sortField: String, filter: JSON): [InsuranceCustomer!]!
  insuranceCustomer(id: ID!): InsuranceCustomer
  customerByRegistration(registrationNumber: String!): InsuranceCustomer

  contracts(vendorId: ID, customerId: ID): [InsuranceContract!]!
  contract(id: ID!): InsuranceContract

  vendorContracts: [InsuranceContract!]!
  vendorContract(id: ID!): InsuranceContract
  
  vendorInsuranceItems(page: Int, perPage: Int, filters: JSON, endDate: Date, startDate: Date, sortDirection: SortDirection, sortField: String, vendorUserId: String, categoryId: ID): InsuranceContractList!
  vendorInsuranceItem(_id: ID!): InsuranceContract

  contractTemplates: [ContractTemplate!]!
  contractTemplate(id: ID!): ContractTemplate
`;

export const mutations = `
  createInsuranceType(name: String!, attributes: [AttributeInput!]): InsuranceType!
  updateInsuranceType(id: ID!, name: String, attributes: [AttributeInput!]): InsuranceType!
  deleteInsuranceType(id: ID!): Boolean!

  createInsuranceProduct(name: String!, insuranceTypeId: ID!, coveredRisks: [CoveredRiskInput!]!, pricingConfig: JSON!, pdfContent: String, templateId: ID): InsuranceProduct!
  updateInsuranceProduct(id: ID!, name: String, coveredRisks: [CoveredRiskInput!], pricingConfig: JSON, pdfContent: String, templateId: ID): InsuranceProduct!
  deleteInsuranceProduct(id: ID!): Boolean!

  createVendor(name: String!): InsuranceVendor!
  updateVendor(id: ID!, name: String!): InsuranceVendor!
  addProductToVendor(vendorId: ID!, productId: ID!, pricingOverride: JSON): InsuranceVendor!
  removeProductFromVendor(vendorId: ID!, productId: ID!): InsuranceVendor!

  createCustomer(input: InsuranceCustomerInput!): InsuranceCustomer!
  updateCustomer(id: ID!, input: InsuranceCustomerInput): InsuranceCustomer!
  deleteCustomer(id: ID!): Boolean!

  createInsuranceContract(vendorId: ID!, customerId: ID!, productId: ID!, insuredObject: JSON!, startDate: Date!, endDate: Date!, paymentKind: String!): InsuranceContract!

  createVendorUser(name: String, email: String!, phone: String, password: String!, vendorId: ID!, role: String): InsuranceVendorUser!
  updateVendorUser(id: ID!, name: String, email: String, phone: String, password: String, role: String): InsuranceVendorUser!
  deleteVendorUser(id: ID!): Boolean!
  vendorUserLogin(email: String!, password: String!): VendorUserLoginResponse!

  createRiskType(name: String!, description: String): RiskType!
  updateRiskType(id: ID!, name: String, description: String): RiskType!
  deleteRiskType(id: ID!): Boolean!

  _migrateTemplateCollection: JSON
  createContractTemplate(name: String!, description: String, htmlContent: String, cssContent: String): ContractTemplate!
  updateContractTemplate(id: ID!, name: String, description: String, htmlContent: String, cssContent: String, status: String): ContractTemplate!
  deleteContractTemplate(id: ID!): DeleteResult!

  generateContractPDF(contractId: ID!): ContractPDFResult!
  saveContractPDF(contractId: ID!, pdfContent: String!): InsuranceContract!
`;
