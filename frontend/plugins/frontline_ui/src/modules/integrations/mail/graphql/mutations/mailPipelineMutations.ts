import { gql } from '@apollo/client';

const PIPELINE_INTEGRATION_FIELDS = `
  _id
  pipelineId
  name
  address
  senderName
  healthStatus
  error
  __typename
`;

export const MAIL_PIPELINE_CONNECT_MUTATION = gql`
  mutation mailPipelineConnect(
    $pipelineId: String!
    $senderName: String
  ) {
    mailPipelineConnect(
      pipelineId: $pipelineId
      senderName: $senderName
    ) {
      ${PIPELINE_INTEGRATION_FIELDS}
    }
  }
`;

export const MAIL_PIPELINE_UPDATE_MUTATION = gql`
  mutation mailPipelineUpdate(
    $pipelineId: String!
    $senderName: String
  ) {
    mailPipelineUpdate(
      pipelineId: $pipelineId
      senderName: $senderName
    ) {
      ${PIPELINE_INTEGRATION_FIELDS}
    }
  }
`;

export const MAIL_PIPELINE_DISCONNECT_MUTATION = gql`
  mutation mailPipelineDisconnect($pipelineId: String!) {
    mailPipelineDisconnect(pipelineId: $pipelineId)
  }
`;
