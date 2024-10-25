import gql from 'graphql-tag';
import {
  mutations as configMutations,
  queries as configQueries,
  types as configTypes,
} from './schema/configs';

import {
  mutations as cleanMutations,
  queries as cleanQueries,
  types as cleanTypes,
} from './schema/cleaning';

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

    ${configTypes}
    ${cleanTypes}
    extend type Mutation {
      ${configMutations}
      ${cleanMutations}
    }

    extend type Query {
      ${configQueries}
      ${cleanQueries}
    }
  `;
};

export default typeDefs;
