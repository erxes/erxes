import gql from 'graphql-tag';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { types, queries, mutations } from './schema/automation';

const typeDefs = async () => {
  const isEnabledTable = {
    tags: isEnabled('tags'),
  };

  return gql`
    scalar JSON
    scalar Date

    ${types(isEnabledTable)}

    extend type Query {
      ${queries}
    }

    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
