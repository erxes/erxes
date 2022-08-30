import { gql } from 'apollo-server-express';

import {
  queries as RiskAssessmentQueries,
  types as RiskAssessmentTypes,
  mutations as RiskAssessmentMutations,
} from './schema/riskassessment';
import {
  queries as RiskAssessmentCategoryQueries,
  types as RiskAssessmentCategoryTypes,
  mutations as RiskAssessmentCategoryMutations,
} from './schema/riskassessmentcategory';
import {
  queries as RiskConfirmityQuries,
  types as RiskConfirmityTypes,
  mutations as RiskConfirmityMutations,
} from './schema/riskconfirmity';

const typeDefs = async (_serviceDiscovery) => {
  return gql`
    scalar JSON
    scalar Date

    ${RiskAssessmentTypes}
    ${RiskAssessmentCategoryTypes}
    ${RiskConfirmityTypes}
    
    extend type Query {
      ${RiskAssessmentQueries}
      ${RiskAssessmentCategoryQueries}
      ${RiskConfirmityQuries}
    }
    
    extend type Mutation {
      ${RiskAssessmentMutations}
      ${RiskAssessmentCategoryMutations}
      ${RiskConfirmityMutations}
    }
  `;
};

export default typeDefs;
