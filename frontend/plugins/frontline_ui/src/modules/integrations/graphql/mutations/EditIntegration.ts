import { gql } from '@apollo/client';

export const EDIT_INTEGRATION = gql`
  mutation IntegrationsEditCommonFields(
    $_id: String!
    $name: String!
    $brandId: String!
    $channelIds: [String]
    $details: JSON
  ) {
    integrationsEditCommonFields(
      _id: $_id
      name: $name
      brandId: $brandId
      channelIds: $channelIds
      details: $details
    ) {
      _id
    }
  }
`;
