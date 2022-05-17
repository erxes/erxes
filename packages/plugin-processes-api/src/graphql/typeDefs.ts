import { gql } from 'apollo-server-express';

import {
  types as jobReferTypes,
  queries as jobReferQueries,
  mutations as jobReferMutations
} from './schema/jobRefer';

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

    extend type Query {
      ${jobReferQueries}
    }

    extend type Mutation {
      ${jobReferMutations}
    }
  `;
};

export default typeDefs;
