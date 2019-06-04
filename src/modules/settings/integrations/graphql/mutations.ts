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
      brand {
        _id
        name
        code
      }
    }
  }
`;

const integrationsCreateExternalIntegration = `
  mutation integrationsCreateExternalIntegration($name: String!, $brandId: String!, $accountId: String!, $kind: String!, $data: JSON) {
    integrationsCreateExternalIntegration(name: $name, brandId: $brandId, accountId: $accountId, kind: $kind, data: $data) {
      _id
      brand {
        _id
        name
        code
      }
    }
  }
`;

const integrationsEditMessenger = `
  mutation integrationsEditMessengerIntegration($_id: String!, ${commonParamsDef}) {
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

const messengerAppsAddLead = `
  mutation messengerAppsAddLead(
    $name: String!
    $integrationId: String!
    $formId: String!
  ) {
    messengerAppsAddLead(
      name: $name
      integrationId: $integrationId
      formId: $formId
    ) {
      _id
    }
  }
`;

const messengerAppsAddKnowledgebase = `
  mutation messengerAppsAddKnowledgebase(
    $name: String!
    $integrationId: String!
    $topicId: String!
  ) {
    messengerAppsAddKnowledgebase(
      name: $name
      integrationId: $integrationId
      topicId: $topicId
    ) {
      _id
    }
  }
`;

const messengerAppsRemove = `
  mutation messengerAppsRemove($_id: String!) {
    messengerAppsRemove(_id: $_id)
  }
`;

const removeAccount = `
  mutation integrationsRemoveAccount($_id: String!) {
    integrationsRemoveAccount(_id: $_id)
  }
`;

export default {
  integrationsCreateMessenger,
  integrationsCreateExternalIntegration,
  integrationsEditMessenger,
  integrationsSaveMessengerConfigs,
  integrationsSaveMessengerAppearance,
  integrationsRemove,
  messengerAppsAddLead,
  messengerAppsAddKnowledgebase,
  messengerAppsRemove,
  removeAccount
};
