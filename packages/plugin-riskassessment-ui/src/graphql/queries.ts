import { riskAssessmentCategoryParams, riskAssessmentParams } from '../common/graphql';
const list = `
  query RiskAssesments {
    riskAssesments {list{${riskAssessmentParams}},totalCount}
  }
`;

const totalCount = `
  query riskassessmentsTotalCountQuery {
    riskassessmentsTotalCount
  }
`;

const listAssessmentCategories = `
  query GetRiskAssesmentCategory {
    getRiskAssesmentCategory {
      ${riskAssessmentCategoryParams}
    }
  }
`;

export default {
  list,
  totalCount,
  listAssessmentCategories,
};
