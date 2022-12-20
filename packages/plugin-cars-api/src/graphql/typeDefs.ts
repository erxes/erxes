import { gql } from 'apollo-server-express';

import {
  types as carTypes,
  queries as carQueries,
  mutations as carMutations
} from './schema/car';

const typeDefs = async serviceDiscovery => {
  const isContactsEnabled = await serviceDiscovery.isEnabled('contacts');

  const isEnabled = {
    contacts: isContactsEnabled
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
