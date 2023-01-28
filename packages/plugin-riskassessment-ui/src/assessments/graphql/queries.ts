// import { commonPaginateDef, commonPaginateValue } from '../../common/graphql';
//
// const paramsDef = `
// ${commonPaginateDef},
// $riskIndicatorId:String,
// $cardType: String,
// $createdFrom: String,
// $createdTo: String,
// $closedFrom: String,
// $closedTo: String
// `;
//
// const paramsValue = `
// ${commonPaginateValue},
// riskIndicatorId:$riskIndicatorId,
// cardType:$cardType,
// createdFrom:$createdFrom
// createdTo:$createdTo
// closedFrom:$closedFrom
// closedTo:$closedTo
// `;
//
// const conformities = `
// query RiskConformities (${paramsDef},$status:String) {
// riskConformities (${paramsValue},status:$status) {
// _id
// cardId
// cardType
// resultScore
// riskIndicator
// riskIndicatorId
// status
// statusColor
// createdAt
// closedAt
// card
// }
// }
// `;
//
// const totalCount = `
// query RiskConformitiesTotalCount (${paramsDef},$status:String) {
// riskConformitiesTotalCount(${paramsValue},status:$status)
// }
// `;
//
// export default { conformities, totalCount };

import { riskIndicatorFields } from '../../indicator/common/graphql';

const commonParams = `
  $branchIds: [String],
  $closedAtFrom: String,
  $closedAtTo: String,
  $createdAtFrom: String,
  $createdAtTo: String,
  $departmentIds: [String],
  $operationIds: [String],
  $page: Int,
  $perPage: Int,
  $riskIndicatorIds: [String],
  $searchValue: String,
  $status: String
`;

const commonParamsDef = ` 
  branchIds: $branchIds,
  closedAtFrom: $closedAtFrom,
  closedAtTo: $closedAtTo,
  createdAtFrom: $createdAtFrom,
  createdAtTo: $createdAtTo,
  departmentIds: $departmentIds,
  operationIds: $operationIds,
  page: $page,
  perPage: $perPage,
  riskIndicatorIds: $riskIndicatorIds,
  searchValue: $searchValue,
  status: $status
 `;

const commonField = `
     _id
    branchIds
    branches
    createdAt
    departmentIds
    operationIds
    operations
    resultScore
    riskIndicatorIds
    riskIndicators {
      ${riskIndicatorFields({
        calculateLogics: false,
        categories: false,
        customScoreField: false,
        forms: false
      })}
    }
    status
    statusColor
    departments
 `;

const riskAssessments = `
  query RiskAssessments(${commonParams}) {
  riskAssessments(${commonParamsDef}) {
    ${commonField}
    conformityDetail
  }
}
`;

const totalCount = `
  query RiskAssessmentsTotalCount(${commonParams}) {
    riskAssessmentsTotalCount(${commonParamsDef})
  }
`;

const riskAssessmentDetail = `
  query RiskAssessmentDetail($id: String) {
    riskAssessmentDetail(id: $id){
      detail {
        ${commonField}
      }
      assignedUsers 
      indicators 
      indicatorForms 
    }
  }
`;

export default { totalCount, riskAssessments, riskAssessmentDetail };
