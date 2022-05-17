import { gql } from 'apollo-server-express';

import { types, queries, mutations } from './schema/product';

import {
  types as productConfigTypes,
  queries as productConfigQueries,
  mutations as productConfigMutations
} from './schema/config';

import {
  types as uomTypes,
  queries as uomQueries,
  mutations as uomMutations
} from './schema/uom';

const typeDefs = async serviceDiscovery => {
  const tagsAvailable = await serviceDiscovery.isEnabled('tags');
  const contactsAvailable = await serviceDiscovery.isEnabled('contacts');

  return gql`
    scalar JSON
    scalar Date
    
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
