import { commonFields, commonListFields } from '../../boards/graphql/mutations';
import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from '../../conformity/graphql/queries';

const commonParams = `
  $companyIds: [String],
  $parentId: String,
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
  $segmentData:String,
  $assignedToMe: String,
  $startDate: String,
  $endDate: String,
  $noSkipArchive: Boolean,
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
  companyIds: $companyIds,
  customerIds: $customerIds,
  parentId: $parentId,
  assignedUserIds: $assignedUserIds,
  closeDateType: $closeDateType,
  priority: $priority,
  source: $source,
  labelIds: $labelIds,
  sortField: $sortField,
  sortDirection: $sortDirection,
  userIds: $userIds,
  segment: $segment,
  segmentData: $segmentData,
  assignedToMe: $assignedToMe,
  startDate: $startDate,
  endDate: $endDate,
  noSkipArchive: $noSkipArchive,
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

export const ticketFields = `
  source
`;

const tickets = `
  query tickets(
    $pipelineId: String,
    $stageId: String,
    $date: ItemDate,
    $skip: Int,
    $limit: Int,
    $search: String,
    ${commonParams}
  ) {
    tickets(
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

const clientPortalComments = `
  query clientPortalComments($typeId: String!, $type: String!) {
    clientPortalComments(typeId: $typeId, type: $type) {
      _id
      content
      createdUser 
      createdAt
      userType
      type
    }
  }
`;

const archivedTicketsParams = `
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
  $sources: [String]
`;

const archivedTicketsArgs = `
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
  sources: $sources
`;

const archivedTickets = `
  query archivedTickets(
    $page: Int
    $perPage: Int
    ${archivedTicketsParams}
  ) {
    archivedTickets(
      page: $page,
      perPage: $perPage,
      ${archivedTicketsArgs}
    ) {
      source
      ${commonFields}
    }
  }
`;

const archivedTicketsCount = `
  query archivedTicketsCount(
    ${archivedTicketsParams}
  ) {
    archivedTicketsCount(
      ${archivedTicketsArgs}
    )
  }
`;

export default {
  tickets,
  ticketsTotalCount,
  ticketDetail,
  archivedTickets,
  archivedTicketsCount,
  clientPortalComments
};
