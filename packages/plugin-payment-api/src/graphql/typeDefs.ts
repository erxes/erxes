import { gql } from 'apollo-server-express';

import { types as paymentType, queries, mutations } from './schema';

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    ${paymentType}

    extend type Query {
      ${queries}
    }

    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
