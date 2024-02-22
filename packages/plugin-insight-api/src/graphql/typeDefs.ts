import gql from 'graphql-tag';

import {
  types as insightTypes,
  queries as insightQueries,
  mutations as insightMutations,
} from './schema/insight';

const typeDefs = async () => {
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
    
    ${insightTypes}
    
    extend type Query {
      ${insightQueries}
    }
    
    extend type Mutation {
      ${insightMutations}
    }
  `;
};

export default typeDefs;
