const commonParams = `
  $cardType:String,
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
  $sortDirection:Int
  $sortField:String
  $tagIds:[String]
  $groupIds:[String]
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
  page: $page,
  perPage: $perPage,
  riskIndicatorIds: $riskIndicatorIds,
  searchValue: $searchValue,
  status: $status,
  sortDirection: $sortDirection
  sortField: $sortField
  tagIds:$tagIds 
  groupIds:$groupIds
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
