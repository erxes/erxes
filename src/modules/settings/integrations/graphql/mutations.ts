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

const mailParamsDef = `
  $erxesApiId: String!,
  $headerId: String,
  $threadId: String,
  $messageId: String,
  $references: String
  $replyToMessageId: String,
  $subject: String!,
  $kind: String,
  $body: String!,
  $to: String!,
  $cc: String,
  $bcc: String,
  $from: String!,
  $attachments: [JSON],
`;

const mailParams = `
  erxesApiId: $erxesApiId,
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
  mutation integrationsCreateExternalIntegration($name: String!, $brandId: String!, $accountId: String, $kind: String!, $data: JSON) {
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

const integrationsEditCommonFields = `
  mutation integrationsEditCommonFields($_id: String!, $name: String!, $brandId: String!) {
    integrationsEditCommonFields(_id: $_id, name: $name, brandId: $brandId) {
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

const engagesConfigSave = `
  mutation engagesConfigSave($secretAccessKey: String!, $accessKeyId: String!, $region: String!) {
    engagesConfigSave(secretAccessKey: $secretAccessKey, accessKeyId: $accessKeyId, region: $region) {
      accessKeyId
      secretAccessKey
      region
    }
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

const addMailAccount = `
  mutation integrationAddMailAccount(
    $email: String!
    $password: String!
    $kind: String!
  ) {
    integrationAddMailAccount(
      email: $email
      password: $password
      kind: $kind
    )
  } 
`;

const addImapAccount = `
  mutation integrationAddImapAccount(
    $email: String! 
    $password: String!
    $imapHost: String!
    $imapPort: Int!
    $smtpHost: String!
    $smtpPort: Int!
    $kind: String!
  ) {
    integrationAddImapAccount(
      email: $email 
      password: $password
      imapHost: $imapHost
      imapPort: $imapPort
      smtpHost: $smtpHost
      smtpPort: $smtpPort
      kind: $kind
    )
  }
`;

const integrationsArchive = `
  mutation integrationsArchive($_id: String!) {
    integrationsArchive(_id: $_id) {
      _id
    }
  }
`;

export default {
  integrationsArchive,
  integrationsCreateMessenger,
  integrationsCreateExternalIntegration,
  integrationsEditCommonFields,
  integrationsEditMessenger,
  integrationsSaveMessengerConfigs,
  integrationsSaveMessengerAppearance,
  integrationsRemove,
  engagesConfigSave,
  messengerAppsAddLead,
  messengerAppsAddKnowledgebase,
  messengerAppsRemove,
  removeAccount,
  integrationSendMail,
  addImapAccount,
  addMailAccount
};
