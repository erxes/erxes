import { gql } from 'apollo-server-express';

import { types, queries, mutations } from './schema/posUser';

const typeDefs = async serviceDiscovery => {
  const PosUserDetailsType = await serviceDiscovery.isEnabled('posuser');
  const PosUser = await serviceDiscovery.isEnabled('posuser');

  return gql`
    scalar JSON
    scalar Date
    
    ${types()}
    
    extend type Query {
      ${queries}
    }
    
    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
