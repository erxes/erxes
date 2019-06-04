const commonParams = `
  $customerIds: [String],
  $companyIds: [String],
  $assignedUserIds: [String],
  $nextDay: String,
  $nextWeek: String,
  $nextMonth: String,
  $noCloseDate: String,
  $overdue: String
`;

const commonParamDefs = `
  customerIds: $customerIds,
  companyIds: $companyIds,
  assignedUserIds: $assignedUserIds,
  nextDay: $nextDay,
  nextWeek: $nextWeek,
  nextMonth: $nextMonth,
  noCloseDate: $noCloseDate,
  overdue: $overdue
`;

const ticketFields = `
  _id
  name
  stageId
  pipeline {
    _id
    name
}
  boardId
  companies {
    _id
    primaryName
    website
  }
  customers {
    _id
    firstName
    primaryEmail
    primaryPhone
  }
  closeDate
  description
  priority
  source
  assignedUsers {
    _id
    email
    details {
      fullName
      avatar
    }
  }
  stage {
    probability
  }
  modifiedAt
  modifiedBy
`;

const tickets = `
  query tickets(
    $pipelineId: String,
    $stageId: String,
    $date: ItemDate,
    $skip: Int,
    $search: String,
    ${commonParams}
  ) {
    tickets(
      pipelineId: $pipelineId,
      stageId: $stageId,
      date: $date,
      skip: $skip,
      search: $search,
      ${commonParamDefs}
    ) {
      ${ticketFields}
    }
  }
`;

const ticketDetail = `
  query ticketDetail($_id: String!) {
    ticketDetail(_id: $_id) {
      ${ticketFields}
    }
  }
`;

export default {
  tickets,
  ticketDetail
};
