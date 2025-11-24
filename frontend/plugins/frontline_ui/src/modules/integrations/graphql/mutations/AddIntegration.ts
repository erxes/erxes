import { gql } from '@apollo/client';

export const ADD_INTEGRATION = gql`
  mutation IntegrationsCreateExternalIntegration(
    $kind: String!
    $name: String!
    $accountId: String
    $channelId: String!
    $data: JSON
  ) {
    integrationsCreateExternalIntegration(
      kind: $kind
      name: $name
      accountId: $accountId
      channelId: $channelId
      data: $data
    ) {
      _id
    }
  }
`;
