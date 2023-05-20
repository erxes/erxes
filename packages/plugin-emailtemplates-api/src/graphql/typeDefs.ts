import { gql } from 'apollo-server-express';

import {
  types as emailTemplateTypes,
  queries as emailTemplateQueries,
  mutations as emailTemplateMutations
} from './schema/emailTemplate';

const typeDefs = async _serviceDiscovery => {
  const tagsEnabled = await _serviceDiscovery.isEnabled('tags');
  const isEnabled = {
    tags: tagsEnabled
  };
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

    ${emailTemplateTypes(isEnabled)}

    extend type Query {
      ${emailTemplateQueries}
    }

    extend type Mutation {
      ${emailTemplateMutations}
    }
  `;
};

export default typeDefs;
