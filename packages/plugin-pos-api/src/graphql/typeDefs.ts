import { gql } from 'apollo-server-express';

import {
  types as posTypes,
  queries as posQueries,
  mutations as posMutations
} from './schema/pos';
import {
  types as posOrderTypes,
  queries as posOrderQueries,
  mutations as posOrderMutations
} from './schema/orders';

const typeDefs = async serviceDiscovery => {
  const contactsEnabled = await serviceDiscovery.isEnabled('contacts');
  const productsEnabled = await serviceDiscovery.isEnabled('products');

  return gql`
    scalar JSON
    scalar Date

    ${posTypes({ contactsEnabled, productsEnabled })}
    ${posOrderTypes({ contactsEnabled, productsEnabled })}

    extend type Query {
      ${posQueries}
      ${posOrderQueries}
    }

    extend type Mutation {
      ${posMutations}
      ${posOrderMutations}
    }
  `;
};

export default typeDefs;
