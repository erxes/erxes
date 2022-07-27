import { gql } from 'apollo-server-express';
import {
  mutations as RemainderMutations,
  queries as RemainderQueries,
  types as RemainderTypes
} from './schema/remainder';
import {
  mutations as SafeRemainderMutations,
  queries as SafeRemainderQueries,
  types as SafeRemainderTypes
} from './schema/safeRemainder';
import {
  mutations as SafeRemainderItemMutations,
  queries as SafeRemainderItemQueries,
  types as SafeRemainderItemTypes
} from './schema/safeRemainderItem';

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
    ${SafeRemainderTypes}
    ${SafeRemainderItemTypes}

    extend type Query {
      ${RemainderQueries}
      ${SafeRemainderQueries}
      ${SafeRemainderItemQueries}
    }

    extend type Mutation {
      ${RemainderMutations}
      ${SafeRemainderMutations}
      ${SafeRemainderItemMutations}
    }
  `;
};

export default typeDefs;
