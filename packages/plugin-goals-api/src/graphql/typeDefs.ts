import gql from 'graphql-tag';

import {
  types as goalTypes,
  queries as goalQueries,
  mutations as goalMutations
} from './schema/goal';

const typeDefs = async _serviceDiscovery => {
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
    
    ${goalTypes}
    
    extend type Query {
      ${goalQueries}
    }
    
    extend type Mutation {
      ${goalMutations}
    }
  `;
};

export default typeDefs;
