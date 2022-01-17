import { gql } from 'apollo-server-express';

import {
  types as CustomerTypes,
  queries as CustomerQueries,
  mutations as CustomerMutations
} from './customer';

import {
  types as CompanyTypes,
  queries as CompanyQueries,
  mutations as CompanyMutations
} from './company';

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${CustomerTypes}
  ${CompanyTypes}
  
  extend type Query {
    ${CustomerQueries}
    ${CompanyQueries}
  }

  extend type Mutation {
    ${CustomerMutations}
    ${CompanyMutations}
  }
`;

export default typeDefs;
