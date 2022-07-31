import { gql } from 'apollo-server-express';

import {
  mutations as directionMutations,
  queries as directionQueries,
  types as directionTypes
} from './schema/directions';
import {
  mutations as placeMutations,
  queries as placeQueries,
  types as placeTypes
} from './schema/places';
import {
  mutations as routeMutations,
  queries as routeQueries,
  types as routeTypes
} from './schema/routes';
import {
  mutations as tripMutations,
  queries as tripQueries,
  types as tripTypes
} from './schema/trips';
import {
  mutations as tumentechMutations,
  queries as tumentechQueries,
  types as tumentechTypes
} from './schema/tumentech';

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
    ${placeTypes}
    ${routeTypes}
    ${directionTypes}
    ${tripTypes(isEnabled)}
    
    extend type Query {
      ${placeQueries}
      ${tumentechQueries}
      ${directionQueries}
      ${routeQueries}
      ${tripQueries}
    }
    
    extend type Mutation {
      ${placeMutations}
      ${tumentechMutations}
      ${directionMutations}
      ${routeMutations}
      ${tripMutations}
    }
  `;
};

export default typeDefs;
