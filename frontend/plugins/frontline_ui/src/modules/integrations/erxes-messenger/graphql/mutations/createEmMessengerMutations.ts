import { gql } from '@apollo/client';

export const CREATE_EM_MESSENGER_MUTATION = gql`
  mutation integrationsCreateEmMessengerIntegration(
    $channelId: String!
    $name: String!
    $languageCode: String
  ) {
    integrationsCreateMessengerIntegration(
      channelId: $channelId
      name: $name
      languageCode: $languageCode
    ) {
      _id
      channel {
        _id
        name
      }
    }
  }
`;

export const SAVE_EM_CONFIGS_MUTATION = gql`
  mutation integrationsSaveMessengerConfigs(
    $_id: String!
    $channelId: String!
    $messengerData: IntegrationMessengerData
    $callData: IntegrationCallData
  ) {
    integrationsSaveMessengerConfigs(
      _id: $_id
      channelId: $channelId
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
    $channelId: String!
    $uiOptions: MessengerUiOptions
  ) {
    integrationsSaveMessengerAppearanceData(
      _id: $_id
      channelId: $channelId
      uiOptions: $uiOptions
    ) {
      _id
    }
  }
`;
