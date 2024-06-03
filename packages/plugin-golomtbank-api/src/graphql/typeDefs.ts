import gql from 'graphql-tag';
import {
  types as configTypes,
  mutations as configMutations,
  queries as configQueries} from'./schema/configs'
// const types = `
//   type Golomtbank {
//     requestId: String,
//     accountId: String,
//     accountName: String,
//     shortName: String
//     currency: String
//     branchId: String
//   }
// `;
 
// const queries = `

//   golomtBankAccounts: JSON
// `;

// const mutations = `
//   golomtbankAccountRemove(_id: String!): String
// `;

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${configTypes}

  extend type Query {
    ${configQueries}
  }

  extend type Mutation {
    ${configMutations}
  }
`;

export default typeDefs;
