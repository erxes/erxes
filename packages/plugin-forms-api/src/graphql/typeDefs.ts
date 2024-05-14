import gql from 'graphql-tag';

import {
  fieldsTypes,
  fieldsQueries,
  fieldsMutations,
  fieldsGroupsTypes,
  fieldsGroupsQueries,
  fieldsGroupsMutations,
} from './schema/field';

import { types, queries, mutations } from './schema/form';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

const typeDefs = async () => {
  const isEnabledTable = {
    contacts: isEnabled('contacts'),
    products: isEnabled('products'),
  };

  return gql`
    scalar JSON
    scalar Date

    ${types(isEnabledTable)}
    ${fieldsTypes(isEnabledTable)}
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
