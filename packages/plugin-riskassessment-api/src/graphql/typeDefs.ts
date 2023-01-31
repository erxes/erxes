import { gql } from 'apollo-server-express';

import { mutations as formSubmissionsMutations } from './schema/formSubmissions';
import {
  mutations as RiskAssessmentMutations,
  queries as RiskAssessmentQueries,
  types as RiskAssessmentTypes
} from './schema/riskIndicator';
import {
  mutations as RiskAssessmentCategoryMutations,
  queries as RiskAssessmentCategoryQueries,
  types as RiskAssessmentCategoryTypes
} from './schema/category';

import {
  mutations as OpearionMutations,
  queries as OpearionQueries,
  types as OpearionTypes
} from './schema/operations';
import {
  mutations as RiskAsessmentMutations,
  queries as RiskAsessmentQueries,
  types as RiskAsessmentTypes
} from './schema/riskAssessment';

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    ${RiskAssessmentTypes}
    ${RiskAssessmentCategoryTypes}
    ${OpearionTypes}
    ${RiskAsessmentTypes}
    
    extend type Query {
      ${RiskAssessmentQueries}
      ${RiskAssessmentCategoryQueries}
      ${OpearionQueries}
      ${RiskAsessmentQueries}
    }
    
    extend type Mutation {
      ${RiskAssessmentMutations}
      ${RiskAssessmentCategoryMutations}
      ${formSubmissionsMutations},
      ${OpearionMutations}
      ${RiskAsessmentMutations}
    }
  `;
};

export default typeDefs;
