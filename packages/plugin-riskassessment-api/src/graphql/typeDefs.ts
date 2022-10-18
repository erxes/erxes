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

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    ${RiskAssessmentTypes}
    ${RiskAssessmentCategoryTypes}
    ${RiskConfirmityTypes}
    ${formSubmissionsTypes}
    
    extend type Query {
      ${RiskAssessmentQueries}
      ${RiskAssessmentCategoryQueries}
      ${RiskConfirmityQueries}
      ${formSubmissionsQueries}
    }
    
    extend type Mutation {
      ${RiskAssessmentMutations}
      ${RiskAssessmentCategoryMutations}
      ${RiskConfirmityMutations}
      ${formSubmissionsMutations}
    }
  `;
};

export default typeDefs;
