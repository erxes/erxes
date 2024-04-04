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

  type Block {
    _id: String!
    balance: Float
    isVerified: String
  }
`;

export const queries = `
  totalInvestment: Float
  getBalance(erxesCustomerId: String): Float
  isVerified(erxesCustomerId: String): String
  investments(erxesCustomerId: String): [Investment]
  totalInvestmentCount: Float
`;

export const mutations = `
  invest(erxesCustomerId: String, packageId: String, amount: Float): Investment
  addBalance(erxesCustomerId: String, amount: Float): Block
  updateVerify(erxesCustomerId: String, isVerified: String): Block
`;
