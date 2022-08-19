import { gql } from 'apollo-server-express';

import {
  types as posTypes,
  queries as posQueries,
  mutations as posMutations
} from './schema/pos';

const typeDefs = async serviceDiscovery => {
  const contactsEnabled = await serviceDiscovery.isEnabled('contacts');
  const productsEnabled = await serviceDiscovery.isEnabled('products');

  return gql`
    scalar JSON
    scalar Date

    ${posTypes({ contactsEnabled, productsEnabled })}

    extend type Query {
      ${posQueries}
    }

    extend type Mutation {
      ${posMutations}
    }
  `;
};

export default typeDefs;
