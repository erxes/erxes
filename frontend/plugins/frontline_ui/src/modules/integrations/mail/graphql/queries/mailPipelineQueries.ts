import { gql } from '~/gql';

export const MAIL_PIPELINE_INTEGRATION_QUERY = gql(`
  query mailPipelineIntegration($pipelineId: String!) {
    mailPipelineIntegration(pipelineId: $pipelineId) {
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
