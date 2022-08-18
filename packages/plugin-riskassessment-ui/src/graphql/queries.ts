import { riskAssessmentCategoryParams, riskAssessmentParams } from '../common/graphql';
const list = `
query RiskAssesments($categoryId: String) {
  riskAssesments(categoryId: $categoryId) {list{${riskAssessmentParams}},totalCount}
  }
`;

const totalCount = `
  query riskassessmentsTotalCountQuery {
    riskassessmentsTotalCount
  }
`;

const listAssessmentCategories = `
  query GetRiskAssesmentCategories {
    getRiskAssesmentCategories {
      ${riskAssessmentCategoryParams}
    }
  }
`;

const assessmentDetail = `
  query RiskAssessmentDetail ($id: String) {
    riskAssessmentDetail (_id: $id) {
      ${riskAssessmentParams}
    }
  }
`;

export default {
  list,
  totalCount,
  listAssessmentCategories,
  assessmentDetail,
};
