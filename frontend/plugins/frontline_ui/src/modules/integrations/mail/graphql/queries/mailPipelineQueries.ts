import { gql } from '@apollo/client';

export const MAIL_PIPELINE_INTEGRATION_QUERY = gql`
  query mailPipelineIntegration($pipelineId: String!) {
    mailPipelineIntegration(pipelineId: $pipelineId) {
      _id
      pipelineId
      name
      address
      senderName
      healthStatus
      error
      __typename
    }
  }
`;
