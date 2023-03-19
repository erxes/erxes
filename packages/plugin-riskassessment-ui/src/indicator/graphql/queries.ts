import {
  commonPaginateDef,
  commonPaginateValue,
  riskIndicatorParams
} from '../../common/graphql';

const commonFilterParams = `
  $branchIds:[String]
  $departmentIds:[String]
  $operationIds:[String]
  $tagIds: [String]
  $ignoreIds:[String]
`;

const commonFilterParamsDef = `
  branchIds:$branchIds
  departmentIds:$departmentIds
  operationIds:$operationIds
  tagIds: $tagIds ,
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

const indicatorDetail = `
query RiskIndicatorDetail($id: String, $fieldsSkip: JSON) {
  riskIndicatorDetail(_id: $id, fieldsSkip: $fieldsSkip) {
      ${riskIndicatorParams}
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

export default {
  list,
  indicatorDetail,
  totalCount
};
