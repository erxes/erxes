import gql from 'graphql-tag';
import {
  mutations as productreviewMutations,
  queries as productreviewQueries,
  types as productreviewTypes,
} from './schema/productreview';
import {
  mutations as wishlistMutations,
  queries as wishlistQueries,
  types as wishlistTypes,
} from './schema/wishlist';

import {
  mutations as lastViewedItemMutations,
  queries as lastViewedItemQueries,
  types as lastViewedItemTypes,
} from './schema/lastViewedItem';

import {
  mutations as addressMutations,
  queries as addressQueries,
  types as addressTypes,
} from './schema/address';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    extend type Product @key(fields: "_id") {
      _id: String! @external
    }

    ${productreviewTypes}
    ${wishlistTypes}
    ${lastViewedItemTypes}
    ${addressTypes}

    extend type Query {
      ${productreviewQueries}
      ${wishlistQueries}
      ${lastViewedItemQueries}
      ${addressQueries}
    }

    extend type Mutation {
      ${productreviewMutations}
      ${wishlistMutations}
      ${lastViewedItemMutations}
      ${addressMutations}
    }
  `;
};

export default typeDefs;
