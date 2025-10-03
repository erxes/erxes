import { gql } from '@apollo/client';

export const CREATE_EM_MESSENGER_MUTATION = gql`
  mutation integrationsCreateEmMessengerIntegration(
    $name: String!
    $brandId: String!
    $languageCode: String
    $channelIds: [String]
  ) {
    integrationsCreateMessengerIntegration(
      name: $name
      brandId: $brandId
      languageCode: $languageCode
      channelIds: $channelIds
    ) {
      _id
      brand {
        _id
        name
        code
      }
    }
  }
`;

export const SAVE_EM_CONFIGS_MUTATION = gql`
  mutation integrationsSaveMessengerConfigs(
    $_id: String!
    $messengerData: IntegrationMessengerData
    $callData: IntegrationCallData
  ) {
    integrationsSaveMessengerConfigs(
      _id: $_id
      messengerData: $messengerData
      callData: $callData
    ) {
      _id
    }
  }
`;

export const SAVE_EM_APPEARANCE_MUTATION = gql`
  mutation integrationsSaveMessengerAppearanceData(
    $_id: String!
    $uiOptions: MessengerUiOptions
  ) {
    integrationsSaveMessengerAppearanceData(_id: $_id, uiOptions: $uiOptions) {
      _id
    }
  }
`;
