import { gql } from 'apollo-server-express';

import { types, queries, mutations } from './schema/account';

const typeDefs = async serviceDiscovery => {
  const tagsAvailable = await serviceDiscovery.isEnabled('tags');
  const contactsAvailable = await serviceDiscovery.isEnabled('contacts');

  return gql`
    scalar JSON
    scalar Date

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }

    directive @cacheControl(
      maxAge: Int
      scope: CacheControlScope
      inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

    ${types(tagsAvailable, contactsAvailable)}


    extend type Query {
      ${queries}
   
    }

    extend type Mutation {
      ${mutations}
   
    }
  `;
};

export default typeDefs;
