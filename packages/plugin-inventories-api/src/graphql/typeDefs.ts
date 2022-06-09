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

    extend type Query {
      ${RemainderQueries}
      ${SafeRemainderQueries}
    }

    extend type Mutation {
      ${RemainderMutations}
      ${SafeRemainderMutations}
    }
  `;
};

export default typeDefs;
