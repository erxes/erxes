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
  $source: [String],
  $labelIds: [String],
  $sortField: String,
  $sortDirection: Int,
  $userIds: [String],
  $segment: String,
  $assignedToMe: String,
  $startDate: String,
  $endDate: String,
  ${conformityQueryFields}
`;

const commonParamDefs = `
  companyIds: $companyIds,
  customerIds: $customerIds,
  assignedUserIds: $assignedUserIds,
  closeDateType: $closeDateType,
  priority: $priority,
  source: $source,
  labelIds: $labelIds,
  sortField: $sortField,
  sortDirection: $sortDirection,
  userIds: $userIds,
  segment: $segment,
  assignedToMe: $assignedToMe,
  startDate: $startDate,
  endDate: $endDate,
  ${conformityQueryFieldDefs}
`;

export const ticketFields = `
  source
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
      ${commonListFields}
    }
  }
`;

const ticketsTotalCount = `
  query ticketsTotalCount(
    $pipelineId: String,
    $stageId: String,
    $date: ItemDate,
    $skip: Int,
    $search: String,
    ${commonParams}
  ) {
    ticketsTotalCount(
      pipelineId: $pipelineId,
      stageId: $stageId,
      date: $date,
      skip: $skip,
      search: $search,
      ${commonParamDefs}
    )
  }
`;

const ticketDetail = `
  query ticketDetail($_id: String!) {
    ticketDetail(_id: $_id) {
      ${ticketFields}
      ${commonFields}
    }
  }
`;

const archivedTickets = `
  query archivedTickets(
    $pipelineId: String!,
    $search: String,
    $page: Int,
    $perPage: Int,
    $userIds: [String],
    $priorities: [String],
    $assignedUserIds: [String],
    $labelIds: [String],
    $productIds: [String],
    $companyIds: [String],
    $customerIds: [String],
    $startDate: String,
    $endDate: String
  ) {
    archivedTickets(
      pipelineId: $pipelineId,
      search: $search,
      page: $page,
      perPage: $perPage,
      userIds: $userIds,
      priorities: $priorities,
      assignedUserIds: $assignedUserIds,
      labelIds: $labelIds,
      productIds: $productIds,
      companyIds: $companyIds,
      customerIds: $customerIds,
      startDate: $startDate,
      endDate: $endDate
    ) {
      source
      ${commonFields}
    }
  }
`;

const archivedTicketsCount = `
  query archivedTicketsCount(
    $pipelineId: String!,
    $search: String,
    $userIds: [String],
    $priorities: [String],
    $assignedUserIds: [String],
    $labelIds: [String],
    $productIds: [String],
    $companyIds: [String],
    $customerIds: [String],
    $startDate: String,
    $endDate: String
  ) {
    archivedTicketsCount(
      pipelineId: $pipelineId,
      search: $search,
      userIds: $userIds,
      priorities: $priorities,
      assignedUserIds: $assignedUserIds,
      labelIds: $labelIds,
      productIds: $productIds,
      companyIds: $companyIds,
      customerIds: $customerIds,
      startDate: $startDate,
      endDate: $endDate
    )
  }
`;

export default {
  tickets,
  ticketsTotalCount,
  ticketDetail,
  archivedTickets,
  archivedTicketsCount
};
