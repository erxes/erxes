import gql from 'graphql-tag';

import {
  mutations as buildingMutations,
  queries as buildingQueries,
  types as buildingTypes
} from './schema/buildings';
import {
  mutations as cityMutations,
  queries as cityQueries,
  types as cityTypes
} from './schema/cities';
import {
  mutations as districtMutations,
  queries as districtQueries,
  types as districtTypes
} from './schema/districts';
import {
  mutations as quarterMutations,
  queries as quarterQueries,
  types as quarterTypes
} from './schema/quarters';

import {
  queries as contractQueries,
  mutations as contractMutations,
  types as contractTypes
} from './schema/contracts';

import {
  queries as productQueries,
  mutations as productMutations,
  types as productTypes
} from './schema/mobinetProducts';

const typeDefs = async serviceDiscovery => {
  const isEnabled = {
    contacts: await serviceDiscovery.isEnabled('contacts'),
    cards: await serviceDiscovery.isEnabled('cards'),
    products: await serviceDiscovery.isEnabled('products'),
    assets: await serviceDiscovery.isEnabled('assets')
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
    
    ${districtTypes}
    ${quarterTypes}
    ${cityTypes}
    ${buildingTypes(isEnabled)}
    ${productTypes}
    ${contractTypes}
    
    extend type Query {
      ${districtQueries}
      ${cityQueries}
      ${quarterQueries}
      ${buildingQueries}
      ${contractQueries}
      ${productQueries}
    }
    
    extend type Mutation {
      ${districtMutations}
      ${cityMutations}
      ${quarterMutations}
      ${buildingMutations}
      ${contractMutations}
      ${productMutations}
    }
  `;
};

export default typeDefs;
