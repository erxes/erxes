import gql from 'graphql-tag';

import {
  mutations as riskMutations,
  queries as riskQueries,
  types as riskTypes
} from './schema/risks';

import {
  mutations as itemMutations,
  queries as itemQueries,
  types as itemTypes
} from './schema/items';

import {
  mutations as packageMutations,
  queries as packageQueries,
  types as packageTypes
} from './schema/packages';
import {
  mutations as productMutations,
  queries as productQueries,
  types as productTypes
} from './schema/products';
import {
  mutations as categoryMutations,
  queries as categoryQueries,
  types as categoryTypes
} from './schema/categories';

import { types as commonTypes } from './schema/commonTypes';

const typeDefs = async serviceDiscovery => {
  const isContactsEnabled = await serviceDiscovery.isEnabled('contacts');
  const isClientportalEnabled = await serviceDiscovery.isEnabled(
    'clientportal'
  );

  const isEnabled = {
    contacts: isContactsEnabled,
    clientportal: isClientportalEnabled
  };

  return gql`
    ${commonTypes(isEnabled)}
    ${itemTypes(isEnabled)}
    ${packageTypes}
    ${riskTypes}
    ${productTypes}
    ${categoryTypes}

    extend type Query {
      ${riskQueries}
      ${itemQueries}
      ${packageQueries}
      ${productQueries}
      ${categoryQueries}
    }

    extend type Mutation {
      ${riskMutations}
      ${itemMutations}
      ${packageMutations}
      ${productMutations}
      ${categoryMutations}
    }`;
};

export default typeDefs;
