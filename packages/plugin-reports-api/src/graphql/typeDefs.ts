import gql from 'graphql-tag';
import { mutations, queries, types } from './schema';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

const typeDefs = async () => {
  const tagsAvailable = await isEnabled('tags');

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
