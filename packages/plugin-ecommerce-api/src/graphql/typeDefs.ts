import { gql } from 'apollo-server-express';
import {
  types as productreviewTypes,
  queries as productreviewQueries,
  mutations as productreviewMutations
} from './schema/productreview';
import {
  types as wishlistTypes,
  queries as wishlistQueries,
  mutations as wishlistMutations
} from './schema/wishlist';

import {
  types as lastViewedItemTypes,
  queries as lastViewedItemQueries,
  mutations as lastViewedItemMutations
} from './schema/lastViewedItem';

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date
    
    extend type Product @key(fields: "_id") {
      _id: String! @external
    }

    ${productreviewTypes}
    ${wishlistTypes}
    ${lastViewedItemTypes}

    extend type Query {
      ${productreviewQueries}
      ${wishlistQueries}
      ${lastViewedItemQueries}
    }

    extend type Mutation {
      ${productreviewMutations}
      ${wishlistMutations}
      ${lastViewedItemMutations}
    }
  `;
};

export default typeDefs;
