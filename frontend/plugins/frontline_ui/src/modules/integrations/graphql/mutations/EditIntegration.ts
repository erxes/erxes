import { gql } from '@apollo/client';

export const EDIT_INTEGRATION = gql`
  mutation IntegrationsEditCommonFields(
    $_id: String!
    $name: String!
    $channelId: String!
    $details: JSON
  ) {
    integrationsEditCommonFields(
      _id: $_id
      name: $name
      channelId: $channelId
      details: $details
    ) {
      _id
    }
  }
`;
