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
     cardId
     cardType
     card{
      _id,name
     }
    branchIds
    branches
    createdAt
    closedAt
    departmentIds
    operationIds
    operations
    resultScore
    riskIndicatorId
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
    riskAssessmentDetail(id: $id)
  }
`;

export default { totalCount, riskAssessments, riskAssessmentDetail };
