import { gql } from 'apollo-server-express';

import {
  types as DocumentTypes,
  queries as DocumentQueries,
  mutations as DocumentMutations
} from './documentTypeDefs';

const typeDefs = async _serviceDiscovery => {
  const tagsEnabled = await _serviceDiscovery.isEnabled('tags');
  const isEnabled = {
    tags: tagsEnabled
  };
  return gql`
  scalar JSON
  scalar Date

  ${DocumentTypes(isEnabled)}

  extend type Query {
    ${DocumentQueries}
  }

  extend type Mutation {
    ${DocumentMutations}
  }
`;
};

export default typeDefs;
