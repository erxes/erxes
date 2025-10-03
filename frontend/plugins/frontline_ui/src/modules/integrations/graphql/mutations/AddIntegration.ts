import { gql } from '@apollo/client';

export const ADD_INTEGRATION = gql`
  mutation IntegrationsCreateExternalIntegration(
    $kind: String!
    $name: String!
    $brandId: String!
    $accountId: String
    $channelIds: [String]
    $data: JSON
  ) {
    integrationsCreateExternalIntegration(
      kind: $kind
      name: $name
      brandId: $brandId
      accountId: $accountId
      channelIds: $channelIds
      data: $data
    ) {
      _id
    }
  }
`;
