import {
  commonPaginateDef,
  commonPaginateValue,
  riskAssessmentCategoryParams,
  riskIndicatorParams
} from '../../common/graphql';

const list = `
query RiskIndicators($categoryIds: [String],$ignoreIds:[String],${commonPaginateDef}) {
  riskIndicators(categoryIds: $categoryIds , ignoreIds:$ignoreIds,${commonPaginateValue}) {${riskIndicatorParams}}
  }
`;

const totalCount = `
query RiskIndicatorsTotalCount($categoryIds: [String],$ignoreIds:[String],${commonPaginateDef}) {
  riskIndicatorsTotalCount(categoryIds: $categoryIds , ignoreIds:$ignoreIds,${commonPaginateValue}) 
  }
`;

const listAssessmentCategories = `
  query RiskAssesmentCategories (${commonPaginateDef}) {
    riskAssesmentCategories (${commonPaginateValue}) {
      ${riskAssessmentCategoryParams}
    }
  }
`;

const indicatorDetail = `
query RiskIndicatorDetail($id: String, $fieldsSkip: JSON) {
  riskIndicatorDetail(_id: $id, fieldsSkip: $fieldsSkip) {
      ${riskIndicatorParams}
      customScoreField {
        label
        percentWeigth
      }
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
  indicatorDetail,
  assessmentHistory,
  totalCount
};
