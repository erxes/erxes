import {
  commonPaginateDef,
  commonPaginateValue,
  riskAssessmentCategoryParams,
  riskIndicatorParams
} from '../../common/graphql';

const commonFilterParams = `
  $branchIds:[String]
  $departmentIds:[String]
  $operationIds:[String]
  $categoryIds: [String]
  $ignoreIds:[String]
`;

const commonFilterParamsDef = `
  branchIds:$branchIds
  departmentIds:$departmentIds
  operationIds:$operationIds
  categoryIds: $categoryIds ,
  ignoreIds:$ignoreIds
`;

const list = `
query RiskIndicators(${commonFilterParams},${commonPaginateDef}) {
  riskIndicators(${commonFilterParamsDef},${commonPaginateValue}) {${riskIndicatorParams}}
  }
`;

const totalCount = `
query RiskIndicatorsTotalCount(${commonFilterParams},${commonPaginateDef}) {
  riskIndicatorsTotalCount(${commonFilterParamsDef},${commonPaginateValue}) 
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
        percentWeight
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
