import { gql } from 'apollo-server-express';

import { types, queries, mutations } from './schema/automation';

const typeDefs = async _serviceDiscovery => {
  const isTagsEnabled = await _serviceDiscovery.isEnabled('tags');

  const isEnabled = {
    tags: isTagsEnabled
  };

  return gql`
    scalar JSON
    scalar Date

    ${types(isEnabled)}

    extend type Query {
      ${queries}
    }

    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
