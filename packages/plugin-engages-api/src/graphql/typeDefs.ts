import { gql } from "apollo-server-express";

import { types, mutations, queries } from './schema/engage';

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
