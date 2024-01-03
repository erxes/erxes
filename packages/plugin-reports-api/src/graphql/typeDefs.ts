import gql from 'graphql-tag';
import { mutations, queries, types } from './schema';

const typeDefs = async serviceDiscovery => {
  const tagsAvailable = await serviceDiscovery.isEnabled('tags');

  return gql`
    scalar JSON
    scalar Date

    ${types(tagsAvailable)}
    
    extend type Query {
      ${queries}
    }
    
    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
