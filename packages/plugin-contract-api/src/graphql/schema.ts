/**
 * This is for defining GraphQL schema
 */

export const types = `
  type Contract {
    _id: String!
    name: String
  }
`;
export const queries = `
  contracts(typeId: String): [Contract]
`;

const params = `
  name: String,
`;

export const mutations = `
  contractsAdd(${params}): Contract
`;
