const commonParams = `
  $mainType: String,
  $mainTypeIds: [String],
  $relType: String,
  $companyIds: [String],
  $customerIds: [String],
  $assignedUserIds: [String],
  $nextDay: String,
  $nextWeek: String,
  $nextMonth: String,
  $noCloseDate: String,
  $overdue: String,
  $priority: [String],
  $source: [String],
`;

const commonParamDefs = `
  mainType: $mainType,
  mainTypeIds: $mainTypeIds,
  relType: $relType,
  companyIds: $companyIds,
  customerIds: $customerIds,
  assignedUserIds: $assignedUserIds,
  nextDay: $nextDay,
  nextWeek: $nextWeek,
  nextMonth: $nextMonth,
  noCloseDate: $noCloseDate,
  overdue: $overdue,
  priority: $priority,
  source: $source
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
  isWatched
  attachments {
    name
    url
    type
    size
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
