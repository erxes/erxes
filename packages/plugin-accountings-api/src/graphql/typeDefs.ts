import gql from 'graphql-tag';

import { types, queries, mutations } from './schema/account';

import {
  types as accountingsConfigTypes,
  queries as accountingsConfigQueries,
  mutations as accountingsConfigMutations,
} from './schema/config';

import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

const typeDefs = async () => {
  const tagsAvailable = await isEnabled('tags');
  const contactsAvailable = await isEnabled('contacts');

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

    ${types(tagsAvailable, contactsAvailable)}
    ${accountingsConfigTypes}

    extend type Query {
      ${queries}
      ${accountingsConfigQueries}
    }

    extend type Mutation {
      ${mutations}
      ${accountingsConfigMutations}
    }
  `;
};

export default typeDefs;
