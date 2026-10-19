import { gql } from '~/gql';

export const MAIL_PIPELINE_CONNECT_MUTATION = gql(`
  mutation mailPipelineConnect(
    $pipelineId: String!
    $senderName: String
    $forwardFrom: String
    $statusId: String
  ) {
    mailPipelineConnect(
      pipelineId: $pipelineId
      senderName: $senderName
      forwardFrom: $forwardFrom
      statusId: $statusId
    ) {
      _id
      pipelineId
      statusId
      name
      address
      senderName
      forwardFrom
      forwardPendingAt
      awaitingForwardVerification
      forwardVerification {
        from
        subject
        code
        link
        excerpt
        receivedAt
      }
      healthStatus
      error
      __typename
    }
  }
`);

export const MAIL_PIPELINE_UPDATE_MUTATION = gql(`
  mutation mailPipelineUpdate(
    $pipelineId: String!
    $senderName: String
    $forwardFrom: String
    $statusId: String
  ) {
    mailPipelineUpdate(
      pipelineId: $pipelineId
      senderName: $senderName
      forwardFrom: $forwardFrom
      statusId: $statusId
    ) {
      _id
      pipelineId
      statusId
      name
      address
      senderName
      forwardFrom
      forwardPendingAt
      awaitingForwardVerification
      forwardVerification {
        from
        subject
        code
        link
        excerpt
        receivedAt
      }
      healthStatus
      error
      __typename
    }
  }
`);

export const MAIL_PIPELINE_FORWARD_VERIFIED_MUTATION = gql(`
  mutation mailPipelineForwardVerified($pipelineId: String!) {
    mailPipelineForwardVerified(pipelineId: $pipelineId) {
      _id
      pipelineId
      statusId
      name
      address
      senderName
      forwardFrom
      forwardPendingAt
      awaitingForwardVerification
      forwardVerification {
        from
        subject
        code
        link
        excerpt
        receivedAt
      }
      healthStatus
      error
      __typename
    }
  }
`);

export const MAIL_PIPELINE_DISCONNECT_MUTATION = gql(`
  mutation mailPipelineDisconnect($pipelineId: String!) {
    mailPipelineDisconnect(pipelineId: $pipelineId)
  }
`);
