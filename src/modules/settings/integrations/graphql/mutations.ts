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

const sendGmailFields = `
  $integrationId: String!,
  $cocType: String!,
  $cocId: String!,
  $subject: String!,
  $body: String!,
  $toEmails: String!,
  $cc: String,
  $bcc: String,
  $attachments: [gmailAttachmentData],
  $headerId: String,
  $references: String,
  $threadId: String
`;

const sendGmailVariables = `
  integrationId: $integrationId,
  cocType: $cocType,
  cocId: $cocId,
  subject: $subject,
  body: $body,
  toEmails: $toEmails,
  cc: $cc,
  bcc: $bcc,
  attachments: $attachments,
  headerId: $headerId,
  references: $references,
  threadId: $threadId
`;

const integrationsCreateMessenger = `
  mutation integrationsCreateMessengerIntegration(${commonParamsDef}) {
    integrationsCreateMessengerIntegration(${commonParams}) {
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

const integrationsSendGmail = ` 
  mutation integrationsSendGmail(${sendGmailFields}) {
    integrationsSendGmail(${sendGmailVariables}) {
      status
      statusText
    }
  }
`;

const integrationsCreateGmail = ` 
  mutation integrationsCreateGmailIntegration(
    $code: String!
    $brandId: String!
  ) {
    integrationsCreateGmailIntegration(code: $code, brandId: $brandId) {
      _id
    }
  }
`;

const integrationsCreateFacebook = `
  mutation integrationsCreateFacebookIntegration(
    $brandId: String!
    $name: String!
    $accountId: String!
    $pageIds: [String!]!
  ) {
    integrationsCreateFacebookIntegration(
      brandId: $brandId
      name: $name
      pageIds: $pageIds
      accountId: $accountId
    ) {
      _id
    }
  }
`;

const integrationsCreateTwitter = `
  mutation save($brandId: String!, $accountId: String!) {
    integrationsCreateTwitterIntegration(
      brandId: $brandId
      accountId: $accountId
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
  mutation accountsRemove($_id: String!) {
    accountsRemove(_id: $_id)
  }
`;

const messengerAppsAddGoogleMeet = `
  mutation messengerAppsAddGoogleMeet(
    $name: String!
    $accountId: String!
  ) {
    messengerAppsAddGoogleMeet(name: $name, accountId: $accountId) {
      _id
    }
  }
`;

const integrationsCreateGmailIntegration = `
  mutation integrationsCreateGmailIntegration(
    $brandId: String!
    $name: String!
    $accountId: String!
  ) {
    integrationsCreateGmailIntegration(
      brandId: $brandId
      name: $name
      accountId: $accountId
    ) {
      _id
    }
  }
`;

export default {
  integrationsCreateMessenger,
  integrationsEditMessenger,
  integrationsSaveMessengerConfigs,
  integrationsSaveMessengerAppearance,
  integrationsSendGmail,
  integrationsCreateGmail,
  integrationsCreateFacebook,
  integrationsCreateTwitter,
  integrationsRemove,
  messengerAppsAddLead,
  messengerAppsAddKnowledgebase,
  messengerAppsRemove,
  removeAccount,
  messengerAppsAddGoogleMeet,
  integrationsCreateGmailIntegration
};
