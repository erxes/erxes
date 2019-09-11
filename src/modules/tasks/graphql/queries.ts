import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from 'modules/conformity/graphql/queries';

const commonParams = `
  $companyIds: [String],
  $customerIds: [String],
  $assignedUserIds: [String],
  $nextDay: String,
  $nextWeek: String,
  $nextMonth: String,
  $noCloseDate: String,
  $overdue: String,
  $priority: [String],
  ${conformityQueryFields}
`;

const commonParamDefs = `
  companyIds: $companyIds,
  customerIds: $customerIds,
  assignedUserIds: $assignedUserIds,
  nextDay: $nextDay,
  nextWeek: $nextWeek,
  nextMonth: $nextMonth,
  noCloseDate: $noCloseDate,
  overdue: $overdue,
  priority: $priority,
  ${conformityQueryFieldDefs}
`;

export const taskFields = `
  _id
  name
  stageId
  hasNotified
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

export default {
  tasks,
  taskDetail
};
