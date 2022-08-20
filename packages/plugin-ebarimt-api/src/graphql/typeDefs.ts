import { gql } from 'apollo-server-express';

import {
  types as ebarimtTypes,
  queries as ebarimtQueries
} from './schema/ebarimt';

const typeDefs = async serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date
    
    ${ebarimtTypes}
    
    extend type Query {
      ${ebarimtQueries}
    }

  `;
};

export default typeDefs;
