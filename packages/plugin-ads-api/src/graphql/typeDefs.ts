import { gql } from 'apollo-server-express';

import {
  types as adsTypes,
  queries as adsQueries,
  mutations as adsMutations
} from './schema/ads';

const typeDefs = async serviceDiscovery => {
  const isContactsEnabled = await serviceDiscovery.isEnabled('contacts');
  const isFormSubmissionEnabled = await serviceDiscovery.isEnabled('forms');

  const isEnabled = {
    contacts: isContactsEnabled,
    forms: isFormSubmissionEnabled
  };

  return gql`
    scalar JSON
    scalar Date

    ${adsTypes(isEnabled)}

    extend type Query {
      ${adsQueries}
    }

    extend type Mutation {
      ${adsMutations}
    }
  `;
};

export default typeDefs;
