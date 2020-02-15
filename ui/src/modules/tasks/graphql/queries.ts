import { commonFields } from 'modules/boards/graphql/mutations';
import { conformityQueryFieldDefs, conformityQueryFields } from 'modules/conformity/graphql/queries';

const commonParams = `
  $companyIds: [String],
  $customerIds: [String],
  $assignedUserIds: [String],
  $closeDateType: String,
  $priority: [String],
  $labelIds: [String],
  $sortField: String,
  $sortDirection: Int,
  ${conformityQueryFields}
`;

const commonParamDefs = `
  companyIds: $companyIds,
  customerIds: $customerIds,
  assignedUserIds: $assignedUserIds,
  closeDateType: $closeDateType,
  priority: $priority,
  labelIds: $labelIds,
  sortField: $sortField,
  sortDirection: $sortDirection,
  ${conformityQueryFieldDefs}
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
      ${commonFields}
    }
  }
`;

const taskDetail = `
  query taskDetail($_id: String!) {
    taskDetail(_id: $_id) {
      ${commonFields}
    }
  }
`;

const archivedTasks = `
  query archivedTasks(
    $pipelineId: String!,
    $search: String,
    $page: Int,
    $perPage: Int,
  ) {
    archivedTasks(
      pipelineId: $pipelineId,
      search: $search,
      page: $page,
      perPage: $perPage,
    ) {
      ${commonFields}
    }
  }
`;

export default {
  tasks,
  taskDetail,
  archivedTasks
};
