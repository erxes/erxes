import gql from 'graphql-tag';

import { types, queries, mutations } from './schema/product';

import {
  types as productConfigTypes,
  queries as productConfigQueries,
  mutations as productConfigMutations,
} from './schema/config';

import {
  types as uomTypes,
  queries as uomQueries,
  mutations as uomMutations,
} from './schema/uom';
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
    ${productConfigTypes}
    ${uomTypes}

    extend type Query {
      ${queries}
      ${productConfigQueries}
      ${uomQueries}
    }

    extend type Mutation {
      ${mutations}
      ${productConfigMutations}
      ${uomMutations}
    }
  `;
};

export default typeDefs;
