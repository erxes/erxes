import gql from 'graphql-tag';

import {
  types as carTypes,
  queries as carQueries,
  mutations as carMutations
} from './schema/car';

const typeDefs = async serviceDiscovery => {
  const isContactsEnabled = await serviceDiscovery.isEnabled('contacts');
  const isTagEnabled = await serviceDiscovery.isEnabled('tags');

  const isEnabled = {
    contacts: isContactsEnabled,
    tags: isTagEnabled
  };

  return gql`
    scalar JSON
    scalar Date
    
    ${carTypes(isEnabled)}
    
    extend type Query {

      ${carQueries}
    }
    
    extend type Mutation {
      ${carMutations}
    }
  `;
};

export default typeDefs;
