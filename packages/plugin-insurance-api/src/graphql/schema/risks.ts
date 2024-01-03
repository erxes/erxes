export const types = `
type Risk @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: ID!
    name: String
    code: String
    description: String
    updatedAt: Date
    lastModifiedBy: User
  }
  
  type RiskPage {
    risks: [Risk]
    count: Int
  }
  
`;

export const queries = `
    risks(searchValue: String, page: Int, perPage: Int): [Risk]
    risksPaginated(
    page: Int
    perPage: Int
    sortField: String
    sortDirection: SortDirection
    searchValue: String
    ): RiskPage
    risk(_id: ID!): Risk
`;

export const mutations = `
    risksAdd(name: String!, code: String!, description: String!): Risk
    risksEdit(_id: ID!, name: String, code: String, description: String): Risk
    risksRemove(_id: ID!): String
`;
