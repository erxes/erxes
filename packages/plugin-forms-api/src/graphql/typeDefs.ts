import { gql } from 'apollo-server-express';

import {
  fieldsTypes,
  fieldsQueries,
  fieldsMutations,
  fieldsGroupsTypes,
  fieldsGroupsQueries,
  fieldsGroupsMutations
} from './schema/field';

import { types, queries, mutations } from './schema/form';

const typeDefs = async serviceDiscovery => {
  const isContactsEnabled = await serviceDiscovery.isEnabled('contacts');
  const isProductsEnabled = await serviceDiscovery.isEnabled('products');

  const isEnabled = {
    contacts: isContactsEnabled,
    products: isProductsEnabled
  };

  return gql`
    scalar JSON
    scalar Date

    ${types(isEnabled)}
    ${fieldsTypes(isEnabled)}
    ${fieldsGroupsTypes}

    extend type Query {
      ${queries}
      ${fieldsQueries}
      ${fieldsGroupsQueries}
    }

    extend type Mutation {
      ${mutations}
      ${fieldsMutations}
      ${fieldsGroupsMutations}
    }
  `;
};

export default typeDefs;
