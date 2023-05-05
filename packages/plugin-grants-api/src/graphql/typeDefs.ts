import { gql } from 'apollo-server-express';

import {
  mutations as grantMutations,
  queries as grantQueries,
  types as grantTypes
} from './schema/grants';

const typeDefs = async serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    extend type User @key(fields: "_id") {
      _id: String! @external
      submitStatus:String
    }

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }

    directive @cacheControl(
      maxAge: Int
      scope: CacheControlScope
      inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

    ${grantTypes}
    
    extend type Query {
      ${grantQueries}
    }
    
    extend type Mutation {
      ${grantMutations}
    }
  `;
};

export default typeDefs;
