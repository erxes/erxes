import gql from 'graphql-tag';

import {
  mutations as directionMutations,
  queries as directionQueries,
  types as directionTypes,
} from './schema/directions';
import {
  mutations as placeMutations,
  queries as placeQueries,
  types as placeTypes,
} from './schema/places';
import {
  mutations as routeMutations,
  queries as routeQueries,
  types as routeTypes,
} from './schema/routes';
import {
  mutations as tripMutations,
  queries as tripQueries,
  types as tripTypes,
} from './schema/trips';
import {
  mutations as tumentechDealMutations,
  queries as tumentechDealQueries,
  types as tumentechDealTypes,
} from './schema/tumentechDeal';
import {
  mutations as tumentechMutations,
  queries as tumentechQueries,
  types as tumentechTypes,
} from './schema/tumentech';

import {
  mutations as accountMutations,
  queries as accountQueries,
  types as accountTypes,
} from './schema/accounts';

import {
  mutations as advertisementMutations,
  queries as advertisementQueries,
  types as advertisementTypes,
} from './schema/advertisement';

import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

const typeDefs = async () => {
  const isContactsEnabled = await isEnabled('contacts');
  const cardsAvailable = await isEnabled('cards');
  const xypAvailable = await isEnabled('xyp');
  const productsAvailable = await isEnabled('products');

  const enabled = {
    contacts: isContactsEnabled,
    cards: cardsAvailable,
    xyp: xypAvailable,
    products: productsAvailable,
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
    
    ${tumentechTypes(enabled)}
    ${placeTypes}
    ${routeTypes}
    ${directionTypes}
    ${tripTypes(enabled)}
    ${tumentechDealTypes(enabled)}
    ${accountTypes(enabled)}
    ${advertisementTypes(enabled)}

    extend type Query {
      ${placeQueries}
      ${tumentechQueries}
      ${directionQueries}
      ${routeQueries}
      ${tripQueries}
      ${tumentechDealQueries}
      ${accountQueries}
      ${advertisementQueries}
    }
    
    extend type Mutation {
      ${placeMutations}
      ${tumentechMutations}
      ${directionMutations}
      ${routeMutations}
      ${tripMutations}
      ${tumentechDealMutations}
      ${accountMutations}
      ${advertisementMutations}

    }
  `;
};

export default typeDefs;
