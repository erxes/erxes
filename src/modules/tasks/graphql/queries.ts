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
  priority: $priority
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

const taskFields = `
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

const tasks = `
  query tasks(
    $pipelineId: String,
    $stageId: String,
    $date: ItemDate,
    $skip: Int,
    $search: String,
    ${commonParams}
  ) {
    tasks(
      pipelineId: $pipelineId,
      stageId: $stageId,
      date: $date,
      skip: $skip,
      search: $search,
      ${commonParamDefs}
    ) {
      ${taskFields}
    }
  }
`;

const taskDetail = `
  query taskDetail($_id: String!) {
    taskDetail(_id: $_id) {
      ${taskFields}
    }
  }
`;

const taskRelatedCustomers = `
  query taskRelatedCustomers($_id: String!) {
    taskRelatedCustomers(_id: $_id) {
      ${customers}
    }
  }
`;

const taskRelatedCompanies = `
  query taskRelatedCompanies($_id: String!) {
    taskRelatedCompanies(_id: $_id) {
      ${companies}
    }
  }
`;

export default {
  tasks,
  taskDetail,
  taskRelatedCompanies,
  taskRelatedCustomers
};
