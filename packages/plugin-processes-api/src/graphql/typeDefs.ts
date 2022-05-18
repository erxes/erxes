import { gql } from 'apollo-server-express';

import {
  types as jobReferTypes,
  queries as jobReferQueries,
  mutations as jobReferMutations
} from './schema/jobRefer';

import {
  types as jobCategoryTypes,
  queries as jobCategoryQueries,
  mutations as jobCategoryMutations
} from './schema/jobCategory';

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

    ${jobReferTypes}
    ${jobCategoryTypes}

    extend type Query {
      ${jobReferQueries}
      ${jobCategoryQueries}
    }

    extend type Mutation {
      ${jobReferMutations}
      ${jobCategoryMutations}
    }
  `;
};

export default typeDefs;
