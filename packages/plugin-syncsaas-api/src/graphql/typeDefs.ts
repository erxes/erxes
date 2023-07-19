import { gql } from 'apollo-server-express';

import {
  mutations as syncMutations,
  queries as syncQueries,
  types as syncTypes
} from './schema/Sync';

const typeDefs = async (serviceDiscovery: any) => {
  return gql`
    scalar JSON
    scalar Date

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }

    directive @cacheControl(
      maxAge: Int
      scope: CacheControlScope
      inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

    ${syncTypes}

    extend type Query {
      ${syncQueries}
    }
    
    extend type Mutation {
      ${syncMutations}
    }
  `;
};

export default typeDefs;
