import {
  commonPaginateDef,
  commonPaginateValue,
  riskAssessmentCategoryParams,
} from '../../common/graphql';

const listAssessmentCategories = `
  query GetRiskAssesmentCategories(${commonPaginateDef}) {
    getRiskAssesmentCategories (${commonPaginateValue}) {
      ${riskAssessmentCategoryParams}
    }
  }
`;

const riskAssessmentDetail = `
  query GetRiskAssesmentCategory ($id: String!) {
    getRiskAssesmentCategory (_id: $id) {
      ${riskAssessmentCategoryParams}
      parent{
        formId
        name
        parentId
        _id
      }
      formName
    }
  }
`;

export default {
  listAssessmentCategories,
  riskAssessmentDetail,
};
