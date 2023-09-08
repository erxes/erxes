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
  $integrationId: String,
  $conversationId: String,
  $replyTo: [String],
  $inReplyTo: String,
  $headerId: String,
  $threadId: String,
  $messageId: String,
  $references: [String]
  $replyToMessageId: String,
  $subject: String!,
  $body: String!,
  $to: [String]!,
  $cc: [String],
  $bcc: [String] ,
  $from: String!,
  $shouldResolve: Boolean,
  $attachments: [JSON],
  $customerId: String
`;

const mailParams = `
  integrationId: $integrationId,
  conversationId: $conversationId,
  replyTo: $replyTo,
  inReplyTo: $inReplyTo,
  headerId: $headerId,
  threadId: $threadId,
  messageId: $messageId,
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
  customerId: $customerId
`;

const imapSendMail = ` 
  mutation imapSendMail(${mailParamsDef}) {
    imapSendMail(${mailParams})
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
  mutation integrationsEditCommonFields($_id: String!, $name: String!, $brandId: String!, $channelIds: [String], $details: JSON) {
    integrationsEditCommonFields(_id: $_id, name: $name, brandId: $brandId, channelIds: $channelIds, details: $details) {
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

const messengerAppSave = `
  mutation messengerAppSave(
    $integrationId: String!
    $messengerApps: MessengerAppsInput
  ) {
    messengerAppSave(
      integrationId: $integrationId
      messengerApps: $messengerApps
    )
  }
`;

const removeAccount = `
  mutation integrationsRemoveAccount($_id: String!, $kind: String) {
    integrationsRemoveAccount(_id: $_id, kind: $kind)
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

const integrationsRepair = `
  mutation integrationsRepair($_id: String!, $kind: String!) {
    integrationsRepair(_id: $_id, kind: $kind) 
  }
`;

const integrationsSendSms = `
  mutation integrationsSendSms($integrationId: String!, $content: String!, $to: String!) {
    integrationsSendSms(integrationId: $integrationId, content: $content, to: $to)
  }
`;

export default {
  integrationsArchive,
  integrationsRepair,
  integrationsUpdateConfigs,
  integrationsCreateMessenger,
  integrationsCreateExternalIntegration,
  integrationsEditCommonFields,
  integrationsEditMessenger,
  integrationsSaveMessengerConfigs,
  integrationsSaveMessengerAppearance,
  integrationsRemove,
  removeAccount,
  imapSendMail,
  integrationsSendSms,
  messengerAppSave
};
