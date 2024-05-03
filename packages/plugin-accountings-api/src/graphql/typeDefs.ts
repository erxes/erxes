import gql from 'graphql-tag';

import { types as accountTypes, queries as accountQueries, mutations as accountMutations } from './schema/account';
import { types as vatRowTypes, queries as vatRowQueries, mutations as vatRowMutations } from './schema/vatRow';
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

    ${accountTypes()}
    ${vatRowTypes()}
    ${accountingsConfigTypes}

    extend type Query {
      ${accountQueries}
      ${accountingsConfigQueries}
      ${vatRowQueries}
    }

    extend type Mutation {
      ${accountMutations}
      ${accountingsConfigMutations}
      ${vatRowMutations}
    }
  `;
};

export default typeDefs;
