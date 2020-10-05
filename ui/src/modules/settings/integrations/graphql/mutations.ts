const commonParamsDef = `
  $name: String!,
  $brandId: String!,
  $languageCode: String,
  $channelIds: [String]
`;

const commonParams = `
  name: $name,
  brandId: $brandId,
  languageCode: $languageCode,
  channelIds: $channelIds
`;

const mailParamsDef = `
  $erxesApiId: String!,
  $replyTo: [String],
  $inReplyTo: String,
  $headerId: String,
  $threadId: String,
  $messageId: String,
  $references: [String]
  $replyToMessageId: String,
  $subject: String!,
  $kind: String,
  $body: String!,
  $to: [String]!,
  $cc: [String],
  $bcc: [String] ,
  $from: String!,
  $shouldResolve: Boolean,
  $attachments: [JSON],
`;

const mailParams = `
  erxesApiId: $erxesApiId,
  replyTo: $replyTo,
  inReplyTo: $inReplyTo,
  headerId: $headerId,
  threadId: $threadId,
  messageId: $messageId,
  kind: $kind,
  references: $references,
  replyToMessageId: $replyToMessageId,
  subject: $subject,
  body: $body,
  to: $to,
  cc: $cc,
  bcc: $bcc,
  from: $from,
  shouldResolve: $shouldResolve,
  attachments: $attachments,
`;

const integrationSendMail = ` 
  mutation integrationSendMail(${mailParamsDef}) {
    integrationSendMail(${mailParams})
  }
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
  mutation integrationsCreateExternalIntegration($name: String!, $brandId: String!, $accountId: String, $kind: String!,$channelIds: [String], $data: JSON) {
    integrationsCreateExternalIntegration(name: $name, brandId: $brandId, accountId: $accountId, kind: $kind, channelIds: $channelIds, data: $data) {
      _id
      brand {
        _id
        name
        code
      }
    }
  }
`;

const integrationsEditCommonFields = `
  mutation integrationsEditCommonFields($_id: String!, $name: String!, $brandId: String!, $channelIds: [String], $data: JSON) {
    integrationsEditCommonFields(_id: $_id, name: $name, brandId: $brandId, channelIds: $channelIds, data: $data) {
      _id
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

const messengerAppsAddWebsite = `
  mutation messengerAppsAddWebsite(
    $name: String!
    $integrationId: String!
    $description: String!
    $buttonText: String!
    $url: String!
  ) {
    messengerAppsAddWebsite(
      name: $name
      integrationId: $integrationId
      description: $description
      buttonText: $buttonText
      url: $url
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

const integrationsUpdateConfigs = `
  mutation integrationsUpdateConfigs($configsMap: JSON!) {
    integrationsUpdateConfigs(configsMap: $configsMap)
  }
`;

const integrationsArchive = `
  mutation integrationsArchive($_id: String!, $status: Boolean!) {
    integrationsArchive(_id: $_id, status: $status) {
      _id
    }
  }
`;

const integrationsSendSms = `
  mutation integrationsSendSms($integrationId: String!, $content: String!, $to: String!) {
    integrationsSendSms(integrationId: $integrationId, content: $content, to: $to)
  }
`;

export default {
  integrationsArchive,
  integrationsUpdateConfigs,
  integrationsCreateMessenger,
  integrationsCreateExternalIntegration,
  integrationsEditCommonFields,
  integrationsEditMessenger,
  integrationsSaveMessengerConfigs,
  integrationsSaveMessengerAppearance,
  integrationsRemove,
  messengerAppsAddLead,
  messengerAppsAddKnowledgebase,
  messengerAppsAddWebsite,
  messengerAppsRemove,
  removeAccount,
  integrationSendMail,
  integrationsSendSms
};
