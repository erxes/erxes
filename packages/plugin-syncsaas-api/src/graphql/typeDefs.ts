import gql from 'graphql-tag';

import {
  mutations as syncMutations,
  queries as syncQueries,
  types as syncTypes
} from './schema/Sync';

import {
  mutations as categoriesMutations,
  queries as categoriesQueries,
  types as categoriesTypes
} from './schema/categories';

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
    ${categoriesTypes}

    extend type Query {
      ${syncQueries}
      ${categoriesQueries}
    }
    
    extend type Mutation {
      ${syncMutations}
      ${categoriesMutations}
    }
  `;
};

export default typeDefs;
