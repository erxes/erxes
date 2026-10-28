import { gql } from '~/gql';

export const GET_TICKET_STATUS_BY_PIPELINE = gql(`
  query getTicketStatusesChoicesPipeline($pipelineId: String!) {
    getTicketStatusesChoicesPipeline(pipelineId: $pipelineId) {
      value
      label
      color
      type
      visibilityType
      memberIds
      canMoveMemberIds
      canEditMemberIds
      departmentIds
    }
  }
`);

export const GET_ACCESSIBLE_TICKET_STATUSES = gql(`
  query getAccessibleTicketStatuses($pipelineId: String!) {
    getAccessibleTicketStatuses(pipelineId: $pipelineId) {
      value
      label
      color
      type
      canMoveMemberIds
      canEditMemberIds
    }
  }
`);
