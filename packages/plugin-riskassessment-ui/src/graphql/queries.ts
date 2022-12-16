import {
  commonPaginateDef,
  commonPaginateValue,
  riskAssessmentCategoryParams,
  riskAssessmentParams
} from '../common/graphql';
const list = `
query RiskAssessments($categoryId: String,$ignoreIds:[String],${commonPaginateDef}) {
  riskAssessments(categoryId: $categoryId , ignoreIds:$ignoreIds,${commonPaginateValue}) {list{${riskAssessmentParams}},totalCount}
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
query RiskAssessmentDetail($id: String, $fieldsSkip: JSON) {
  riskAssessmentDetail(_id: $id, fieldsSkip: $fieldsSkip) {
      ${riskAssessmentParams}
    }
  }
`;

const assessmentHistory = `
query RiskFormSubmitHistory($cardId:String,$cardType:String,$riskAssessmentId: String) {
  riskFormSubmitHistory(cardId:$cardId,cardType:$cardType,riskAssessmentId: $riskAssessmentId) {
    cardId
    cardType
    card
    formId
    riskAssessment
    riskAssessmentId
    users {
      _id
      fields {
        description
        fieldId
        optionsValues
        text
        value
      }
      user
    }
  }
}
`;

export default {
  list,
  listAssessmentCategories,
  assessmentDetail,
  assessmentHistory
};
