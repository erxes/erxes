import { gql } from 'apollo-server-express';
import {
  types as RemainderTypes,
  queries as RemainderQueries,
  mutations as RemainderMutations
} from './schema/remainder';
import {
  types as SafeRemainderTypes,
  queries as SafeRemainderQueries
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
    }
  `;
};

export default typeDefs;
