import { gql } from 'apollo-server-express';

import {
  types as discountTypes,
  queries as discountQueries,
  mutations as discountMutations
} from './schema/discount';

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }

    directive @cacheControl(
      maxAge: Int,
      scope: CacheControlScope,
      inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

    ${discountTypes()}
    
    extend type Query {
      ${discountQueries}
    }
    
    extend type Mutation {
      ${discountMutations}
    }
  `;
};

export default typeDefs;
