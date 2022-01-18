import { gql } from "apollo-server-express";

import {
  types as engageTypes,
  queries as engageQueries,
  mutations as engageMutations
} from './schema/engage';

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${engageTypes}

  extend type Query {
    ${engageQueries}
  }
  extend type Mutation {
    ${engageMutations}
  }
`;

export default typeDefs;
