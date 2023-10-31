import gql from 'graphql-tag';
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
  mutations as ReserveRemMutations,
  queries as ReserveRemQueries,
  types as ReserveRemTypes
} from './schema/reserveRems';
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
    ${ReserveRemTypes}
    ${TransactionTypes}

    extend type Query {
      ${RemainderQueries}
      ${SafeRemainderQueries}
      ${SafeRemainderItemQueries}
      ${ReserveRemQueries}
      ${TransactionQueries}
    }

    extend type Mutation {
      ${RemainderMutations}
      ${SafeRemainderMutations}
      ${SafeRemainderItemMutations}
      ${ReserveRemMutations}
      ${TransactionMutations}
    }
  `;
};

export default typeDefs;
