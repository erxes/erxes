import { riskAssessmentCategoryParams } from '../../common/graphql';

const listAssessmentCategories = `
  query GetRiskAssesmentCategory {
    getRiskAssesmentCategory {
      ${riskAssessmentCategoryParams}
    }
  }
`;

export default {
  listAssessmentCategories,
};
