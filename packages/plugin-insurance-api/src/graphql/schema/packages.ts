export const types = `
type InsurancePackage @key(fields: "_id") {
    _id: ID!
    name: String!
    productIds: [ID!]!
  
    products: [InsuranceProduct]
  
    lastModifiedBy: User
    lastModifiedAt: Date
    createdAt: Date!
  }
  
  type InsurancePackageList {
    list: [InsurancePackage!]!
    totalCount: Int!
  }
  
  input InsurancePackageInput {
    name: String!
    productIds: [ID!]!
  }
    
`;

export const queries = `
    insurancePackage(_id: ID!): InsurancePackage
    insurancePackages(
    page: Int
    perPage: Int
    sortField: String
    sortDirection: SortDirection
    searchValue: String
    ): [InsurancePackage!]!
    insurancePackageList(
    page: Int
    perPage: Int
    sortField: String
    sortDirection: SortDirection
    searchValue: String
    ): InsurancePackageList
`;

export const mutations = `
    insurancePackageAdd(input: InsurancePackageInput!): InsurancePackage!
    insurancePackageEdit(
    _id: ID!
    input: InsurancePackageInput!
    ): InsurancePackage!
    insurancePackageRemove(_id: ID!): JSON
`;
