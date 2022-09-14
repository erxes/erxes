import {
  commonPaginateDef,
  commonPaginateValue,
  riskAssessmentCategoryParams,
  riskAssessmentParams
} from '../common/graphql';
const list = `
query RiskAssessments($categoryId: String,${commonPaginateDef}) {
  riskAssessments(categoryId: $categoryId , ${commonPaginateValue}) {list{${riskAssessmentParams}},totalCount}
  }
`;

const totalCount = `
  query riskassessmentsTotalCountQuery {
    riskassessmentsTotalCount
  }
`;

const listAssessmentCategories = `
  query RiskAssesmentCategories (${commonPaginateDef}) {
    riskAssesmentCategories (${commonPaginateValue}) {
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
