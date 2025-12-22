export const types = `
"""
харилцагчийн төрөл individual=хувь хүн, company=байгууллага
"""
enum CustomerType {
  """
  хувь хүн
  """
  individual
  """
  байгууллага
  """
  company
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
даатгалын зүйлийн аттрибут
"""
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

"""
Даатгалын төрөл
"""
type InsuranceType {
  id: ID!
  name: String!
  attributes: [AttributeDefinition!]!
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
  """
  Даатгалын үнийн тохиргоо, даатгалын хураамжын хувь эсвэл гадаадад зорчих чиглэл өдөр зэргээс хамаарсан хураамжын утга
  """
  pricingConfig: JSON!
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
  """
  Аттрибутын input
  """
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

  """
  даатгуулагчийн input
  """
  input InsuranceCustomerInput {
    firstName: String!
    lastName: String!
    type: CustomerType!
    registrationNumber: String!
    email: String
    phone: String
    companyName: String
  }

  """
  Даатгалын гэрээний input
  """
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
  """
  Эрсдлийн төрлүүдийн жагсаалт
  """
  riskTypes: [RiskType!]!
  """
  Эрсдлийн төрөл
  """
  riskType(id: ID!): RiskType


  """
  Даатгалын төрлүүдийн жагсаалт
  """
  insuranceTypes: [InsuranceType!]!
  """
  Даатгалын төрөл
  """
  insuranceType(id: ID!): InsuranceType


  """
  Даатгалын бүтээгдэхүүнүүдийн жагсаалт
  """
  insuranceProducts: [InsuranceProduct!]!
  """
  Даатгалын бүтээгдэхүүн
  """
  insuranceProduct(id: ID!): InsuranceProduct
  """
  Төрөлөөр бүтээгдэхүүнүүд
  """
  productsByType(typeId: ID!): [InsuranceProduct!]!

  """
  vendor компаниудын жагсаалт
  """
  vendors: [InsuranceVendor!]!
  """
  Vendor компани
  """
  vendor(id: ID!): InsuranceVendor

  """
  Миний vendor
  """
  myVendor: InsuranceVendor

  """
  Vendor хэрэглэгчдийн жагсаалт
  """
  vendorUsers(vendorId: ID): [InsuranceVendorUser!]!
  """
  Vendor хэрэглэгч
  """
  vendorUser(id: ID!): InsuranceVendorUser

  """
  Даатгалын харилцагчид
  """
  insuranceCustomers: [InsuranceCustomer!]!
  """
  Даатгалын харилцагч
  """
  insuranceCustomer(id: ID!): InsuranceCustomer

  """
  Админд зориулсан гэрээний жагсаалт
  """
  contracts(vendorId: ID, customerId: ID): [InsuranceContract!]!
  """
  Аднинд Гэрээнийн дэлгэрэнгүй мэдээлэл
  """
  contract(id: ID!): InsuranceContract

  """
  Vendor-ийн гэрээний жагсаалт
  """
  vendorContracts: [InsuranceContract!]!
  """
  Vendor-ийн гэрээний дэлгэрэнгүй мэдээлэл
  """
  vendorContract(id: ID!): InsuranceContract
`;

export const mutations = `
  """
  Даатгалын төрөл үүсгэх
  """
  createInsuranceType(name: String!, attributes: [AttributeInput!]): InsuranceType!
  """
  Даатгалын төрөл шинэчлэх
  """
  updateInsuranceType(id: ID!, name: String, attributes: [AttributeInput!]): InsuranceType!
  """
  Даатгалын төрөл устгах
  """
  deleteInsuranceType(id: ID!): Boolean!

  """
  Даатгалын бүтээгдэхүүн үүсгэх
  """
  createInsuranceProduct(
    name: String!
    insuranceTypeId: ID!
    coveredRisks: [CoveredRiskInput!]!
    pricingConfig: JSON!
  ): InsuranceProduct!
  """
  Даатгалын бүтээгдэхүүн шинэчлэх
  """
  updateInsuranceProduct(
    id: ID!
    name: String
    coveredRisks: [CoveredRiskInput!]
    pricingConfig: JSON
  ): InsuranceProduct!
  """
  Даатгалын бүтээгдэхүүн устгах
  """
  deleteInsuranceProduct(id: ID!): Boolean!


  """
  Vendor үүсгэх
  """
  createVendor(name: String!): InsuranceVendor!
  """
  Vendor шинэчлэх
  """
  updateVendor(id: ID!, name: String!): InsuranceVendor!
  """
  Vendor-д бүтээгдэхүүн нэмэх
  """
  addProductToVendor(vendorId: ID!, productId: ID!, pricingOverride: JSON): InsuranceVendor!
  """
  Vendor-оос бүтээгдэхүүн хасах
  """
  removeProductFromVendor(vendorId: ID!, productId: ID!): InsuranceVendor!


  """
  Харилцагч үүсгэх
  """
  createCustomer(input: InsuranceCustomerInput!): InsuranceCustomer!
  """
  Харилцагч шинэчлэх
  """
  updateCustomer(id: ID!, input: InsuranceCustomerInput): InsuranceCustomer!
  """
  Харилцагч устгах
  """
  deleteCustomer(id: ID!): Boolean!


  """
  Даатгалын гэрээ үүсгэх
  """
  createInsuranceContract(
    vendorId: ID!
    customerId: ID!
    productId: ID!
    insuredObject: JSON!
    startDate: Date!
    endDate: Date!
  ): InsuranceContract!


  """
  Vendor хэрэглэгч үүсгэх
  """
  createVendorUser(name: String, email: String!, phone: String, password: String!, vendorId: ID!, role: String): InsuranceVendorUser!
  """
  Vendor хэрэглэгч засах
  """
  updateVendorUser(id: ID!, name: String, email: String, phone: String, password: String, role: String): InsuranceVendorUser!
  """
  Vendor хэрэглэгч устгах
  """
  deleteVendorUser(id: ID!): Boolean!

  """
  Эрсдлийн төрөл үүсгэх
  """
  createRiskType(name: String!, description: String): RiskType!
  """
  Эрсдлийн төрөл шинэчлэх
  """
  updateRiskType(id: ID!, name: String, description: String): RiskType!
  """
  Эрсдлийн төрөл устгах
  """
  deleteRiskType(id: ID!): Boolean!
`;
