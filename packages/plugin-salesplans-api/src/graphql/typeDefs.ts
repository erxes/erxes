import { gql } from 'apollo-server-express';

import {
  types as salesLogTypes,
  queries as salesLogQueries,
  mutations as salesLogMutations
} from './schema/salesplans';

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

    ${salesLogTypes()}

    extend type Query {
      ${salesLogQueries}
    }

    extend type Mutation {
      ${salesLogMutations}
    }
  `;
};

export default typeDefs;
