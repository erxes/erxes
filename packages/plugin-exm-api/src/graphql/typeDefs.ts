import { gql } from 'apollo-server-express';

import { types, mutations, queries } from './schema/exm';

const typeDefs = async serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    ${await types(serviceDiscovery)}

    extend type Query {
      ${queries}
    }

    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
