const commonParams = `
  $customerIds: [String],
  $companyIds: [String],
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
  customerIds: $customerIds,
  companyIds: $companyIds,
  assignedUserIds: $assignedUserIds,
  nextDay: $nextDay,
  nextWeek: $nextWeek,
  nextMonth: $nextMonth,
  noCloseDate: $noCloseDate,
  overdue: $overdue,
  priority: $priority,
  source: $source
`;

const companies = `
  _id
  primaryName
  website
`;

const customers = `
  _id
  firstName
  primaryEmail
  primaryPhone
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
    ${companies}
  }
  customers {
    ${customers}
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

const ticketRelatedCustomers = `
  query ticketRelatedCustomers($_id: String!) {
    ticketRelatedCustomers(_id: $_id) {
      ${customers}
    }
  }
`;

const ticketRelatedCompanies = `
  query ticketRelatedCompanies($_id: String!) {
    ticketRelatedCompanies(_id: $_id) {
      ${companies}
    }
  }
`;

export default {
  tickets,
  ticketDetail,
  ticketRelatedCompanies,
  ticketRelatedCustomers
};
