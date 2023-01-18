import { gql } from 'apollo-server-express';

import {
  mutations as formSubmissionsMutations,
  queries as formSubmissionsQueries,
  types as formSubmissionsTypes
} from './schema/formSubmissions';
import {
  mutations as RiskAssessmentMutations,
  queries as RiskAssessmentQueries,
  types as RiskAssessmentTypes
} from './schema/riskassessment';
import {
  mutations as RiskAssessmentCategoryMutations,
  queries as RiskAssessmentCategoryQueries,
  types as RiskAssessmentCategoryTypes
} from './schema/category';
import {
  mutations as RiskConfirmityMutations,
  queries as RiskConfirmityQueries,
  types as RiskConfirmityTypes
} from './schema/confirmity';

import {
  mutations as OpearionMutations,
  queries as OpearionQueries,
  types as OpearionTypes
} from './schema/operations';

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    ${RiskAssessmentTypes}
    ${RiskAssessmentCategoryTypes}
    ${RiskConfirmityTypes}
    ${formSubmissionsTypes}
    ${OpearionTypes}
    
    extend type Query {
      ${RiskAssessmentQueries}
      ${RiskAssessmentCategoryQueries}
      ${RiskConfirmityQueries}
      ${formSubmissionsQueries}
      ${OpearionQueries}
    }
    
    extend type Mutation {
      ${RiskAssessmentMutations}
      ${RiskAssessmentCategoryMutations}
      ${RiskConfirmityMutations}
      ${formSubmissionsMutations},
      ${OpearionMutations}
    }
  `;
};

export default typeDefs;
