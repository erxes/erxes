import { gql } from 'apollo-server-express';

import {
  types as RemainderTypes,
  queries as RemainderQueries,
  mutations as RemainderMutations
} from './schema/remainder';

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

    ${RemainderTypes}

    extend type Query {
      ${RemainderQueries}
    }


  `;
};

export default typeDefs;
