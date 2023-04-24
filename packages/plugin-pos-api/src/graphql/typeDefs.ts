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
import {
  types as posCoverTypes,
  queries as posCoverQueries,
  mutations as posCoverMutations
} from './schema/covers';

const typeDefs = async serviceDiscovery => {
  const contactsEnabled = await serviceDiscovery.isEnabled('contacts');
  const productsEnabled = await serviceDiscovery.isEnabled('products');

  return gql`
    scalar JSON
    scalar Date
    

    ${posTypes({ contactsEnabled, productsEnabled })}
    ${posOrderTypes({ contactsEnabled, productsEnabled })}
    ${posCoverTypes}

    extend type Query {
      ${posQueries}
      ${posOrderQueries}
      ${posCoverQueries}
    }

    extend type Mutation {
      ${posMutations}
      ${posOrderMutations}
      ${posCoverMutations}
    }
  `;
};

export default typeDefs;
