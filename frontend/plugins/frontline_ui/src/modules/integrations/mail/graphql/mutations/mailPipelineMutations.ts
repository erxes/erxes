import { gql } from '@apollo/client';
import { PIPELINE_INTEGRATION_FIELDS } from '../queries/mailPipelineQueries';

export const MAIL_PIPELINE_CONNECT_MUTATION = gql`
  mutation mailPipelineConnect(
    $pipelineId: String!
    $senderName: String
    $forwardFrom: String
  ) {
    mailPipelineConnect(
      pipelineId: $pipelineId
      senderName: $senderName
      forwardFrom: $forwardFrom
    ) {
      ${PIPELINE_INTEGRATION_FIELDS}
    }
  }
`;

export const MAIL_PIPELINE_UPDATE_MUTATION = gql`
  mutation mailPipelineUpdate(
    $pipelineId: String!
    $senderName: String
    $forwardFrom: String
  ) {
    mailPipelineUpdate(
      pipelineId: $pipelineId
      senderName: $senderName
      forwardFrom: $forwardFrom
    ) {
      ${PIPELINE_INTEGRATION_FIELDS}
    }
  }
`;

export const MAIL_PIPELINE_FORWARD_VERIFIED_MUTATION = gql`
  mutation mailPipelineForwardVerified($pipelineId: String!) {
    mailPipelineForwardVerified(pipelineId: $pipelineId) {
      ${PIPELINE_INTEGRATION_FIELDS}
    }
  }
`;

export const MAIL_PIPELINE_DISCONNECT_MUTATION = gql`
  mutation mailPipelineDisconnect($pipelineId: String!) {
    mailPipelineDisconnect(pipelineId: $pipelineId)
  }
`;
