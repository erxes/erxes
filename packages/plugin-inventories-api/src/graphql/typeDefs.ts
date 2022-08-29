import { gql } from 'apollo-server-express';
import extendTypes from './schema/extendTypes';
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
import {
  mutations as TransactionMutations,
  queries as TransactionQueries,
  types as TransactionTypes
} from './schema/transaction';

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

    ${extendTypes}
    ${RemainderTypes}
    ${SafeRemainderTypes}
    ${SafeRemainderItemTypes}
    ${TransactionTypes}

    extend type Query {
      ${RemainderQueries}
      ${SafeRemainderQueries}
      ${SafeRemainderItemQueries}
      ${TransactionQueries}
    }

    extend type Mutation {
      ${RemainderMutations}
      ${SafeRemainderMutations}
      ${SafeRemainderItemMutations}
      ${TransactionMutations}
    }
  `;
};

export default typeDefs;
