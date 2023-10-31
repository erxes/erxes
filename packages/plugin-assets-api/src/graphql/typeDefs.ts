import gql from 'graphql-tag';

import {
  mutations as assetMutations,
  queries as assetQueries,
  types as assetTypes
} from './schema/assets';
import {
  mutations as movementMutations,
  queries as movementQueries,
  types as movementTypes
} from './schema/movements';

const typeDefs = async serviceDiscovery => {
  const contactsAvailable = await serviceDiscovery.isEnabled('contacts');

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
