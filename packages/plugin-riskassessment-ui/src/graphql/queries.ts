import {
  commonPaginateDef,
  commonPaginateValue,
  riskAssessmentCategoryParams,
  riskAssessmentParams
} from '../common/graphql';

const list = `
query RiskAssessments($categoryIds: [String],$ignoreIds:[String],${commonPaginateDef}) {
  riskAssessments(categoryIds: $categoryIds , ignoreIds:$ignoreIds,${commonPaginateValue}) {${riskAssessmentParams}}
  }
`;

const totalCount = `
query RiskAssessmentsTotalCount($categoryIds: [String],$ignoreIds:[String],${commonPaginateDef}) {
  riskAssessmentsTotalCount(categoryIds: $categoryIds , ignoreIds:$ignoreIds,${commonPaginateValue}) 
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
      calculateMethod
      calculateLogics {
      _id
      color
      logic
      name
      value
      value2
    }
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
  assessmentHistory,
  totalCount
};
