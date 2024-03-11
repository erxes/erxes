export const types = `
type InsuranceCategory @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: ID!
    name: String
    code: String
    description: String
    riskIds: [String]
    companyIds: [String]

    risks: [Risk]

    companies: [Company]

    lastModifiedBy: User
    lastModifiedAt: Date
  }
  
  type InsuranceCategoryList {
    list: [InsuranceCategory]
    totalCount: Int
  }
  
`;

export const queries = `
    insuranceCategories(searchValue: String, page: Int, perPage: Int): [InsuranceCategory]
    insuranceCategoryList(
    page: Int
    perPage: Int
    sortField: String
    sortDirection: SortDirection
    searchValue: String
    ): InsuranceCategoryList
    insuranceCategoriesOfVendor: [InsuranceCategory]
    insuranceCategory(_id: ID!): InsuranceCategory
`;

export const mutations = `
insuranceCategoryAdd(name: String!, code: String!, description: String!, riskIds: [String], companyIds: [String]): InsuranceCategory
insuranceCategoryEdit(_id: ID!, name: String, code: String, description: String, riskIds: [String], companyIds: [String]): InsuranceCategory
insuranceCategoryRemove(_id: ID!): String
`;
