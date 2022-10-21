export const types = `
  type Transaction {
    _id: String!
    erxesCustomerId: String
    type: String
    status: String
    createdAt: Date
    modifiedAt: Date
  }
`;

export const queries = `
  transaction(erxesCustomerId: String, type: String): [Transaction]
`;

const transactionParams = `
  erxesCustomerId: String
  type: String
  status: String
`;

export const mutations = `
  transactionsAdd(${transactionParams}): Transaction
`;
