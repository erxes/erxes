import gql from 'graphql-tag';

import {
  types as packegeTypes,
  queries as packageQueries,
  mutations as packageMutations
} from './schema/packages';

import {
  queries as blockQueries,
  types as blockTypes,
  mutations as blockMutations
} from './schema/block';

import {
  queries as transactionQueries,
  types as transactionTypes,
  mutations as transactionMutations
} from './schema/transaction';

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    ${packegeTypes}
    ${blockTypes}
    ${transactionTypes}
    
    extend type Query {
      ${packageQueries}
      ${blockQueries}
      ${transactionQueries}
    }
    
    extend type Mutation {
      ${packageMutations}
      ${blockMutations}
      ${transactionMutations}
    }
  `;
};

export default typeDefs;
