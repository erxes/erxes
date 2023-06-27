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
  mutations as tumentechDealMutations,
  queries as tumentechDealQueries,
  types as tumentechDealTypes
} from './schema/tumentechDeal';
import {
  mutations as tumentechMutations,
  queries as tumentechQueries,
  types as tumentechTypes
} from './schema/tumentech';

import {
  mutations as accountMutations,
  queries as accountQueries,
  types as accountTypes
} from './schema/accounts';

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
    ${tumentechDealTypes(isEnabled)}
    ${accountTypes(isEnabled)}
    
    extend type Query {
      ${placeQueries}
      ${tumentechQueries}
      ${directionQueries}
      ${routeQueries}
      ${tripQueries}
      ${tumentechDealQueries}
      ${accountQueries}
    }
    
    extend type Mutation {
      ${placeMutations}
      ${tumentechMutations}
      ${directionMutations}
      ${routeMutations}
      ${tripMutations}
      ${tumentechDealMutations}
      ${accountMutations}
    }
  `;
};

export default typeDefs;
