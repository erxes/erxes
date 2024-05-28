import gql from 'graphql-tag';

import {
  queries as rcfaQueries,
  types as rcfaTypes,
  mutations as rcfaMutations
} from './schema/rcfa';
import {
  mutations as rcfaQuestionMutations,
  queries as rcfaQuestionQueries,
  types as rcfaQuestionTypes
} from './schema/issues';

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

    ${rcfaTypes}
    ${rcfaQuestionTypes}

    extend type Query {
      ${rcfaQueries}
      ${rcfaQuestionQueries}
    }
    
    extend type Mutation {
      ${rcfaMutations}
      ${rcfaQuestionMutations}
    }
  `;
};

export default typeDefs;
