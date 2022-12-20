import { gql } from 'apollo-server-express';

import {
  types as DocumentTypes,
  queries as DocumentQueries,
  mutations as DocumentMutations
} from './documentTypeDefs';

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${DocumentTypes}

  extend type Query {
    ${DocumentQueries}
  }

  extend type Mutation {
    ${DocumentMutations}
  }
`;

export default typeDefs;
