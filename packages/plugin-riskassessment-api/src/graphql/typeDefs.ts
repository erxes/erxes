import { gql } from 'apollo-server-express';

import { queries as RiskAssessmentQuery, types as RiskAssessmentTypes, mutations as RiskAssessmentMutations } from './schema/riskassessment';
import { queries as RiskAssessmentCategoryQuery, types as RiskAssessmentCategoryTypes, mutations as RiskAssessmentCategoryMutations } from './schema/riskassessmentcategory';

const typeDefs = async (_serviceDiscovery) => {
  return gql`
    scalar JSON
    scalar Date

    ${RiskAssessmentTypes}
    ${RiskAssessmentCategoryTypes}
    
    extend type Query {
      ${RiskAssessmentQuery}
      ${RiskAssessmentCategoryQuery}
    }
    
    extend type Mutation {
      ${RiskAssessmentMutations}
      ${RiskAssessmentCategoryMutations}
    }
  `;
};

export default typeDefs;
