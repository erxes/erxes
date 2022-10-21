export const types = `
  type Investment {
    _id: String!
    erxesCustomerId: String
    packageId: String    
    createdAt: Date
    modifiedAt: Date
    amount: Float

    package: Package
  }
`;

export const queries = `
  totalInvestment: Float
  getBalance(erxesCustomerId: String): Float
  isVerified(erxesCustomerId: String): Boolean
  investments(erxesCustomerId: String): [Investment]
`;

export const mutations = `
  invest(erxesCustomerId: String, packageId: String, amount: Float): Investment
`;
