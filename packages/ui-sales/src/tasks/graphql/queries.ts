import { commonFields, commonListFields } from '../../boards/graphql/mutations';
import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from '../../conformity/graphql/queries';

const commonParams = `
  $companyIds: [String],
  $customerIds: [String],
  $parentId: String,
  $assignedUserIds: [String],
  $closeDateType: String,
  $priority: [String],
  $labelIds: [String],
  $sortField: String,
  $sortDirection: Int,
  $userIds: [String],
  $segment: String,
  $segmentData:String,
  $assignedToMe: String,
  $startDate: String,
  $endDate: String,
  $hasStartAndCloseDate: Boolean
  $noSkipArchive: Boolean
  $branchIds:[String]
  $departmentIds:[String]
  ${conformityQueryFields}
  $createdStartDate: Date
  $createdEndDate: Date
  $stateChangedStartDate: Date
  $stateChangedEndDate: Date
  $startDateStartDate: Date
  $startDateEndDate: Date
  $closeDateStartDate: Date
  $closeDateEndDate: Date
`;

const commonParamDefs = `
  companyIds: $companyIds
  customerIds: $customerIds
  parentId: $parentId
  assignedUserIds: $assignedUserIds
  closeDateType: $closeDateType
  priority: $priority
  labelIds: $labelIds
  sortField: $sortField
  sortDirection: $sortDirection
  userIds: $userIds
  segment: $segment
  segmentData: $segmentData,
  assignedToMe: $assignedToMe
  startDate: $startDate
  endDate: $endDate
  hasStartAndCloseDate: $hasStartAndCloseDate
  noSkipArchive: $noSkipArchive
  branchIds: $branchIds,
  departmentIds: $departmentIds,
  ${conformityQueryFieldDefs}
  createdStartDate: $createdStartDate
  createdEndDate: $createdEndDate
  stateChangedStartDate: $stateChangedStartDate
  stateChangedEndDate: $stateChangedEndDate
  startDateStartDate: $startDateStartDate
  startDateEndDate: $startDateEndDate
  closeDateStartDate: $closeDateStartDate
  closeDateEndDate: $closeDateEndDate
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
