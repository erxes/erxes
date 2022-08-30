import { gql } from 'apollo-server-express'

import {
  fieldsGroupsMutations, fieldsGroupsQueries, fieldsGroupsTypes, fieldsMutations, fieldsQueries, fieldsTypes
} from './schema/field'

import { mutations, queries, types } from './schema/form'

const typeDefs = async serviceDiscovery => {
  const isContactsEnabled = await serviceDiscovery.isEnabled('contacts');
  const isProductsEnabled = await serviceDiscovery.isEnabled('products');
  const isRiskAssessmentEnabled = await serviceDiscovery.isEnabled('riskassessment');

  const isEnabled = {
    contacts: isContactsEnabled,
    products: isProductsEnabled,
    riskAssessment:isRiskAssessmentEnabled
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
