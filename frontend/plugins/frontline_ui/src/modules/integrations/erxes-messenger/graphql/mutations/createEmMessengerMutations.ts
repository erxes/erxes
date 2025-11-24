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
export const SAVE_EM_TICKET_CONFIG_MUTATION = gql`
  mutation IntegrationsSaveMessengerTicketData(
    $_id: String!
    $configId: String!
  ) {
    integrationsSaveMessengerTicketData(_id: $_id, configId: $configId) {
      _id
      ticketConfigId
    }
  }
`;

export const EDIT_EM_MESSENGER_MUTATION = gql`
  mutation IntegrationsEditMessengerIntegration(
    $id: String!
    $channelId: String!
    $name: String!
    $languageCode: String
  ) {
    integrationsEditMessengerIntegration(
      _id: $id
      channelId: $channelId
      name: $name
      languageCode: $languageCode
    ) {
      _id
    }
  }
`;
