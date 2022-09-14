import {
  commonPaginateDef,
  commonPaginateValue,
  riskAssessmentCategoryParams
} from '../../common/graphql';

const listAssessmentCategories = `
  query RiskAssesmentCategories(${commonPaginateDef}) {
    riskAssesmentCategories (${commonPaginateValue}) {
      ${riskAssessmentCategoryParams}
    }
  }
`;

const riskAssessmentDetail = `
  query riskAssesmentCategory ($id: String!) {
    riskAssesmentCategory (_id: $id) {
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
  riskAssessmentDetail
};
