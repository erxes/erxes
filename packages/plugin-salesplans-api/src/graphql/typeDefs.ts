import { gql } from 'apollo-server-express';

import {
  types as salesLogTypes,
  queries as salesLogQueries,
  mutations as salesLogMutations
} from './schema/salesplans';

import {
  types as settingsTypes,
  queries as settingsQueries,
  mutations as settingsMutations
} from './schema/settings';

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
    ${settingsTypes}

    extend type Query {
      ${salesLogQueries},
      ${settingsQueries},
    }

    extend type Mutation {
      ${salesLogMutations},
      ${settingsMutations}
    }
  `;
};

export default typeDefs;
