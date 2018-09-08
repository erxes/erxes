const commonParamsDef = `
  $name: String!,
  $brandId: String!,
  $languageCode: String
`;

const commonParams = `
  name: $name,
  brandId: $brandId,
  languageCode: $languageCode
`;

const integrationsCreateMessenger = `
  mutation integrationsCreateMessengerIntegration(${commonParamsDef}) {
    integrationsCreateMessengerIntegration(${commonParams}) {
      _id
    }
  }
`;

const integrationsEditMessenger = `
  mutation integrationsEditMessengerIntegration($_id: String!, ${
    commonParamsDef
  }) {
    integrationsEditMessengerIntegration(_id: $_id, ${commonParams}) {
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

const integrationsRemove = `
  mutation integrationsRemove($_id: String!) {
    integrationsRemove(_id: $_id)
  }
`;

const messengerAppsAdd = `
  mutation messengerAppsAdd(
    $kind: String!
    $name: String!
    $credentials: JSON
  ) {
    messengerAppsAdd(kind: $kind, name: $name, credentials: $credentials) {
      _id
    }
  }
`;

export default {
  integrationsCreateMessenger,
  integrationsEditMessenger,
  integrationsSaveMessengerConfigs,
  integrationsSaveMessengerAppearance,
  integrationsRemove,
  messengerAppsAdd
};
