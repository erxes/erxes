import { gql } from "apollo-server-express";

import { types, mutations, queries } from './schema/engage';
import { types as logTypes, queries as logQueries } from './schema/engageLog';

const typeDefs = async (serviceDiscovery) => {
  return gql`
    scalar JSON
    scalar Date

    ${await types(serviceDiscovery)}
    ${logTypes}

    extend type Query {
      ${queries}
      ${logQueries}
    }

    extend type Mutation {
      ${mutations}
    }
  `;
}

export default typeDefs;
