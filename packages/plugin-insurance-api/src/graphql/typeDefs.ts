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
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

const typeDefs = async () => {
  const isContactsEnabled = await isEnabled('contacts');
  const isClientportalEnabled = await isEnabled(
    'clientportal'
  );

  const isEnabledTable = {
    contacts: isContactsEnabled,
    clientportal: isClientportalEnabled
  };

  return gql`
    ${commonTypes(isEnabledTable)}
    ${itemTypes(isEnabledTable)}
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
