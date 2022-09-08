import {
  commonPaginateDef,
  commonPaginateValue,
  riskAssessmentCategoryParams,
  riskAssessmentParams
} from '../common/graphql';
const list = `
query RiskAssesments($categoryId: String,${commonPaginateDef}) {
  riskAssesments(categoryId: $categoryId , ${commonPaginateValue}) {list{${riskAssessmentParams({
  status: true
})}},totalCount}
  }
`;

const totalCount = `
  query riskassessmentsTotalCountQuery {
    riskassessmentsTotalCount
  }
`;

const listAssessmentCategories = `
  query GetRiskAssesmentCategories (${commonPaginateDef}) {
    getRiskAssesmentCategories (${commonPaginateValue}) {
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
  assessmentDetail
};
