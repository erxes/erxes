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

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    ${productreviewTypes}
    ${wishlistTypes}

    extend type Query {
      ${productreviewQueries}
      ${wishlistQueries}
    }

    extend type Mutation {
      ${productreviewMutations}
      ${wishlistMutations}
    }
  `;
};

export default typeDefs;
