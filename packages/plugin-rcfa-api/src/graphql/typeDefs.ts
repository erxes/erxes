import { gql } from 'apollo-server-express';

import {
  mutations as rcfaMutations,
  queries as rcfaQueries,
  types as rcfaTypes
} from './schema/rcfa';
import {
  mutations as rcfaQuestionMutations,
  queries as rcfaQuestionQueries,
  types as rcfaQuestionTypes
} from './schema/issues';

const typeDefs = async (serviceDiscovery: any) => {
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
