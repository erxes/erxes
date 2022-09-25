import { gql } from 'apollo-server-express';

import {
  types as qpayTypes,
  queries as qpayQueries,
  mutations as qpayMutations
} from './schema/qpay';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    ${await qpayTypes()}
    
    extend type Query {

      ${qpayQueries}
    }
    
    extend type Mutation {
      ${qpayMutations}
    }
  `;
};

export default typeDefs;
