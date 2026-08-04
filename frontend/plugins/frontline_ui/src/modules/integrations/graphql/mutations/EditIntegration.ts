import { gql } from '@apollo/client';

export const EDIT_INTEGRATION = gql`
  mutation IntegrationsEditCommonFields(
    $_id: String!
    $name: String!
    $channelId: String!
    $brandId: String
    $details: JSON
  ) {
    integrationsEditCommonFields(
      _id: $_id
      name: $name
      channelId: $channelId
      brandId: $brandId
      details: $details
    ) {
      _id
    }
  }
`;
