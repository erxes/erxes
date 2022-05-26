import { gql } from 'apollo-server-express';
import {
  types as tumentechTypes,
  queries as tumentechQueries,
  mutations as tumentechMutations
} from './schema/tumentech';
import {
  types as directionTypes,
  queries as directionQueries,
  mutations as directionMutations
} from './schema/directions';
import {
  types as routeOptionTypes,
  queries as routeOptionQueries,
  mutations as routeOptionMutations
} from './schema/routeOptions';

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
    
    ${tumentechTypes(isEnabled)}
    ${routeOptionTypes}
    ${directionTypes}
    
    extend type Query {
      ${tumentechQueries}
      ${directionQueries}
      ${routeOptionQueries}
    }
    
    extend type Mutation {
      ${tumentechMutations}
      ${directionMutations}
      ${routeOptionMutations}
    }
  `;
};

export default typeDefs;
