import { gql } from '~/gql';

export const CREATE_EM_MESSENGER_MUTATION = gql(`
  mutation integrationsCreateEmMessengerIntegration(
    $channelId: String!
    $name: String!
    $languageCode: String
    $brandId: String!
  ) {
    integrationsCreateMessengerIntegration(
      channelId: $channelId
      name: $name
      languageCode: $languageCode
      brandId: $brandId
    ) {
      _id
      brandId
      channel {
        _id
        name
      }
    }
  }
`);

export const SAVE_EM_CONFIGS_MUTATION = gql(`
  mutation integrationsSaveMessengerConfigs(
    $_id: String!
    $messengerData: IntegrationMessengerData
    $brandId: String!
  ) {
    integrationsSaveMessengerConfigs(
      _id: $_id
      messengerData: $messengerData
      brandId: $brandId
    ) {
      _id
    }
  }
`);

export const SAVE_EM_APPEARANCE_MUTATION = gql(`
  mutation integrationsSaveMessengerAppearanceData(
    $_id: String!
    $uiOptions: MessengerUiOptions
    $brandId: String!
  ) {
    integrationsSaveMessengerAppearanceData(
      _id: $_id
      uiOptions: $uiOptions
      brandId: $brandId
    ) {
      _id
    }
  }
`);
export const SAVE_EM_TICKET_CONFIG_MUTATION = gql(`
  mutation IntegrationsSaveMessengerTicketData(
    $_id: String!
    $configIds: [String]
  ) {
    integrationsSaveMessengerTicketData(_id: $_id, configIds: $configIds) {
      _id
      ticketConfigIds
    }
  }
`);

export const EDIT_EM_MESSENGER_MUTATION = gql(`
  mutation IntegrationsEditMessengerIntegration(
    $id: String!
    $channelId: String!
    $name: String!
    $languageCode: String
    $brandId: String!
  ) {
    integrationsEditMessengerIntegration(
      _id: $id
      channelId: $channelId
      name: $name
      languageCode: $languageCode
      brandId: $brandId
    ) {
      _id
    }
  }
`);
