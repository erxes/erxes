export const types = `
  type Trading {
    _id: String!
    name: String
  }
`;

export const queries = `
  tradings: [Trading]
  tradingsTotalCount: Int
  tradingsWalletCount: Int
  tradingsWallets: [Wallet]
`;

const params = `
  name: String!,
`;
const walletParams = `
  currencyCode: String!
  userId:  String
  status:  Int!
  name: String!
  type: Int!
  walletNumber: String
`;
export const mutations = `
  tradingsAdd(${params}): Trading
  tradingsWalletAdd(${walletParams}): Wallet
`;
export const mysqlUserTypes = `
type Wallet {
   id: ID!
   currencyCode: String!
   currency: Currency
   userId:  String
   status:  Int!
   name: String!
   type: Int!
   createdAt: String
   createdUserId: String
   updatedAt: String
   updatedUserId: String
   walletNumber: String
 }
 type Currency {
   id: ID!
   code: String
   name: String
   status: Int
   createdAt: String
   createdUserId: String
   updatedAt: String
   updatedUserId: String
   wallets: [Wallet]
 }
`;
