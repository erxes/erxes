import { gql } from '@apollo/client';

export const GET_TICKET_STATUS_BY_PIPELINE = gql`
  query getTicketStatusesChoicesPipeline($pipelineId: String!) {
    getTicketStatusesChoicesPipeline(pipelineId: $pipelineId)
  }
`;
