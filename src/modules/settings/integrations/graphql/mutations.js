const integrationsCreateMessenger = `
  mutation integrationsCreateMessengerIntegration($name: String!, $brandId: String!, $languageCode: String) {
    integrationsCreateMessengerIntegration(
      name: $name
      brandId: $brandId
      languageCode: $languageCode
    ) {
      _id
    }
  }
`;

const integrationsSaveMessengerConfigs = `
  mutation integrationsSaveMessengerConfigs($_id: String!, $messengerData: IntegrationMessengerData) {
    integrationsSaveMessengerConfigs(_id: $_id, messengerData: $messengerData) {
      _id
    }
  }
`;

const integrationsSaveMessengerAppearance = `
  mutation integrationsSaveMessengerAppearanceData($_id: String!, $uiOptions: MessengerUiOptions) {
    integrationsSaveMessengerAppearanceData(
      _id: $_id
      uiOptions: $uiOptions
    ) {
      _id
    }
  }
`;

export default {
  integrationsCreateMessenger,
  integrationsSaveMessengerConfigs,
  integrationsSaveMessengerAppearance
};
