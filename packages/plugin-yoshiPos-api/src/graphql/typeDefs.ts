import { gql } from 'apollo-server-express';

import {
  types as posTypes,
  queries as posQueries,
  mutations as posMutations
} from './schemas/index';

const typeDefs = async serviceDiscovery => {
  const isContactsEnabled = await serviceDiscovery.isEnabled('contacts');
  const cardsAvailable = await serviceDiscovery.isEnabled('cards');

  const isEnabled = {
    contacts: isContactsEnabled,
    cards: cardsAvailable
  };

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
    
    ${posTypes}
    
    extend type Query {
      ${posQueries}
    }
    
    extend type Mutation {
      ${posMutations}
    }
  `;
};

export default typeDefs;
