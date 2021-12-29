import {
  commonFields,
  commonListFields
} from 'modules/boards/graphql/mutations';
import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from 'modules/conformity/graphql/queries';

const commonParams = `
  $companyIds: [String],
  $customerIds: [String],
  $assignedUserIds: [String],
  $closeDateType: String,
  $priority: [String],
  $labelIds: [String],
  $sortField: String,
  $sortDirection: Int,
  $userIds: [String],
  $segment: String,
  $assignedToMe: String,
  $startDate: String,
  $endDate: String,
  $hasStartAndCloseDate: Boolean
  ${conformityQueryFields}
`;

const commonParamDefs = `
  companyIds: $companyIds
  customerIds: $customerIds
  assignedUserIds: $assignedUserIds
  closeDateType: $closeDateType
  priority: $priority
  labelIds: $labelIds
  sortField: $sortField
  sortDirection: $sortDirection
  userIds: $userIds
  segment: $segment
  assignedToMe: $assignedToMe
  startDate: $startDate
  endDate: $endDate
  hasStartAndCloseDate: $hasStartAndCloseDate
  ${conformityQueryFieldDefs}
`;

const tasks = `
  query tasks(
    $pipelineId: String,
    $stageId: String,
    $date: ItemDate,
    $skip: Int,
    $limit: Int,
    $search: String,
    ${commonParams}
  ) {
    tasks(
      pipelineId: $pipelineId,
      stageId: $stageId,
      date: $date,
      skip: $skip,
      limit: $limit,
      search: $search,
      ${commonParamDefs}
    ) {
      ${commonListFields}
    }
  }
`;

const tasksTotalCount = `
  query tasks(
    $pipelineId: String,
    $stageId: String,
    $date: ItemDate,
    $skip: Int,
    $search: String,
    ${commonParams}
  ) {
    tasksTotalCount(
      pipelineId: $pipelineId,
      stageId: $stageId,
      date: $date,
      skip: $skip,
      search: $search,
      ${commonParamDefs}
    )
  }
`;

const taskDetail = `
  query taskDetail($_id: String!) {
    taskDetail(_id: $_id) {
      ${commonFields}
    }
  }
`;

const archivedTasksParams = `
  $pipelineId: String!
  $search: String
  $userIds: [String]
  $priorities: [String]
  $assignedUserIds: [String]
  $labelIds: [String]
  $companyIds: [String]
  $customerIds: [String]
  $startDate: String
  $endDate: String
`;

const archivedTasksArgs = `
  pipelineId: $pipelineId
  search: $search
  userIds: $userIds
  priorities: $priorities
  assignedUserIds: $assignedUserIds
  labelIds: $labelIds
  companyIds: $companyIds
  customerIds: $customerIds
  startDate: $startDate
  endDate: $endDate
`;

const archivedTasks = `
  query archivedTasks(
    $page: Int
    $perPage: Int
    ${archivedTasksParams}
  ) {
    archivedTasks(
      page: $page
      perPage: $perPage
     ${archivedTasksArgs}
    ) {
      ${commonFields}
    }
  }
`;

const archivedTasksCount = `
  query archivedTasksCount(
    ${archivedTasksParams}
  ) {
    archivedTasksCount(
      ${archivedTasksArgs}
    )
  }
`;

export default {
  tasks,
  tasksTotalCount,
  taskDetail,
  archivedTasks,
  archivedTasksCount
};
