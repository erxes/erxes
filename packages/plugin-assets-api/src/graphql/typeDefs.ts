import gql from 'graphql-tag';

import {
  mutations as assetMutations,
  queries as assetQueries,
  types as assetTypes,
} from './schema/assets';
import {
  mutations as movementMutations,
  queries as movementQueries,
  types as movementTypes,
} from './schema/movements';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

const typeDefs = async () => {
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

    ${assetTypes(contactsAvailable)}
    ${movementTypes(contactsAvailable)}
    
    extend type Query {
      ${assetQueries}
      ${movementQueries}
    }
    
    extend type Mutation {
      ${assetMutations}
      ${movementMutations}
    }
  `;
};

export default typeDefs;
