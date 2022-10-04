import { gql } from 'apollo-server-express';

import { types, queries, mutations } from './schema';

const typeDefs = async serviceDiscovery => {
  const isContactsEnabled = await serviceDiscovery.isEnabled('contacts');

  const isEnabled = {
    contacts: isContactsEnabled
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
