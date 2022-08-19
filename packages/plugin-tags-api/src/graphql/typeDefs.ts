import { gql } from 'apollo-server-express';

import {
  types as tagTypes,
  queries as tagQueries,
  mutations as tagMutations
} from './schema/tag';

const typeDefs = async (_serviceDiscovery) => {
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
    
    ${tagTypes}
    
    extend type Query {
      ${tagQueries}
    }
    
    extend type Mutation {
      ${tagMutations}
    }
  `;
};

export default typeDefs;
