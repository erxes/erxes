import gql from 'graphql-tag';

const types = `
  type Golomtbank {
    requestId: String,
    accountId: String,
    accountName: String,
    shortName: String
    currency: String
    branchId: String
  }
`;

const queries = `

  golomtBankAccounts: JSON
`;

const mutations = `
  golomtbankAccountRemove(_id: String!): String
`;

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${types}

  extend type Query {
    ${queries}
  }

  extend type Mutation {
    ${mutations}
  }
`;

export default typeDefs;
