import { gql } from 'apollo-server-express';

import {
  types as clientPortalTypes,
  queries as clientPortalQueries,
  mutations as clientPortalMutations,
} from './clientPortalTypeDefs';

const typeDefs = async (serviceDiscovery) => {
  const contactAvialable = await serviceDiscovery.isAvailable('contacts');
  const cardAvailable = await serviceDiscovery.isAvailable('cards');
  return gql`
    scalar JSON
    scalar Date
    ${clientPortalTypes(contactAvialable, cardAvailable)}

    extend type Query {
     ${clientPortalQueries(cardAvailable)}
    }

    extend type Mutation {
      ${clientPortalMutations(contactAvialable, cardAvailable)} 
    }
  `;
};

export default typeDefs;
