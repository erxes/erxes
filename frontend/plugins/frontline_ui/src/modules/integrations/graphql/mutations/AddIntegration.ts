import { gql } from '@apollo/client';

export const ADD_INTEGRATION = gql`
  mutation IntegrationsCreateExternalIntegration(
    $kind: String!
    $name: String!
    $accountId: String
    $channelId: String!
    $brandId: String
    $data: JSON
  ) {
    integrationsCreateExternalIntegration(
      kind: $kind
      name: $name
      accountId: $accountId
      channelId: $channelId
      brandId: $brandId
      data: $data
    ) {
      _id
    }
  }
`;
