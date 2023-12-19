const commonPaginationParams = `
  $page: Int,
  $perPage: Int,
  $sortDirection:Int
  $sortField:String
`;

const commonPaginationParamsDef = `
  page: $page,
  perPage: $perPage,
  sortDirection: $sortDirection
  sortField: $sortField
`;

const commonParams = `
  $cardType:String,
  $branchIds: [String],
  $closedAtFrom: String,
  $closedAtTo: String,
  $createdAtFrom: String,
  $createdAtTo: String,
  $departmentIds: [String],
  $operationIds: [String],
  $riskIndicatorIds: [String],
  $searchValue: String,
  $status: String
  $tagIds:[String]
  $groupIds:[String]
  $cardFilter:CardFilter
`;

const commonParamsDef = ` 
  cardType:$cardType,
  branchIds: $branchIds,
  closedAtFrom: $closedAtFrom,
  closedAtTo: $closedAtTo,
  createdAtFrom: $createdAtFrom,
  createdAtTo: $createdAtTo,
  departmentIds: $departmentIds,
  operationIds: $operationIds,
  riskIndicatorIds: $riskIndicatorIds,
  searchValue: $searchValue,
  status: $status,
  tagIds:$tagIds 
  groupIds:$groupIds,
  cardFilter:$cardFilter
 `;

const commonField = `
     _id
     cardId
     cardType
     card{
      _id,name
     }
     createdAt
     closedAt
    branchId
    branch {
      _id,title
    }
    departmentId
    department {
      _id,title
    }
    operationId
    operation {
      _id,name
    }
    resultScore
    indicatorId
    groupId
    group{
      _id,name
    }
    riskIndicators {
      _id,name
    }
    status
    statusColor
    permittedUserIds
 `;

const riskAssessments = `
  query RiskAssessments(${commonParams},${commonPaginationParams}) {
  riskAssessments(${commonParamsDef},${commonPaginationParamsDef}) {
    ${commonField}
  }
}
`;

const totalCount = `
  query RiskAssessmentsTotalCount(${commonParams},${commonPaginationParams}) {
    riskAssessmentsTotalCount(${commonParamsDef},${commonPaginationParamsDef})
  }
`;

const riskAssessmentDetail = `
  query RiskAssessmentDetail($id: String,$showFlagged: Boolean) {
    riskAssessmentDetail(id: $id,showFlagged: $showFlagged)
  }
`;

const getStatistic = `
  query RiskAssessmentStatistics(${commonParams}) {
    riskAssessmentStatistics(${commonParamsDef}){
      averageScore
      submittedAssessmentCount
      totalCount
    }
  }
`;

export default {
  totalCount,
  riskAssessments,
  riskAssessmentDetail,
  getStatistic
};
