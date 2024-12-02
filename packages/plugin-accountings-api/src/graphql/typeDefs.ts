import gql from 'graphql-tag';
import extendTypes from './schema/extendTypes';
import { types as accountTypes, queries as accountQueries, mutations as accountMutations } from './schema/account';
import { types as transactionTypes, queries as transactionQueries, mutations as transactionMutations } from './schema/transactionCommon';
import { types as vatRowTypes, queries as vatRowQueries, mutations as vatRowMutations } from './schema/vatRow';
import { types as ctaxRowTypes, queries as ctaxRowQueries, mutations as ctaxRowMutations } from './schema/ctaxRow';
import {
  types as accountingsConfigTypes,
  queries as accountingsConfigQueries,
  mutations as accountingsConfigMutations,
} from './schema/config';

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

    ${extendTypes}
    ${accountTypes()}
    ${vatRowTypes()}
    ${ctaxRowTypes()}
    ${accountingsConfigTypes}
    ${transactionTypes()}

    extend type Query {
      ${accountQueries}
      ${accountingsConfigQueries}
      ${vatRowQueries}
      ${ctaxRowQueries}
      ${transactionQueries}
    }

    extend type Mutation {
      ${accountMutations}
      ${accountingsConfigMutations}
      ${vatRowMutations}
      ${ctaxRowMutations}
      ${transactionMutations}
    }
  `;
};

export default typeDefs;
