import { gql } from '@apollo/client';

export const PIPELINE_INTEGRATION_FIELDS = `
  _id
  pipelineId
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
`;

export const MAIL_PIPELINE_INTEGRATION_QUERY = gql`
  query mailPipelineIntegration($pipelineId: String!) {
    mailPipelineIntegration(pipelineId: $pipelineId) {
      ${PIPELINE_INTEGRATION_FIELDS}
    }
  }
`;
