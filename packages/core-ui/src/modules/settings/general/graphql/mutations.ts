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
  $customerId: String
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
  customerId: $customerId
`;

const integrationSendMail = ` 
  mutation integrationSendMail(${mailParamsDef}) {
    integrationSendMail(${mailParams})
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

const integrationsRemove = `
  mutation integrationsRemove($_id: String!) {
    integrationsRemove(_id: $_id)
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
  mutation integrationsRepair($_id: String!) {
    integrationsRepair(_id: $_id) 
  }
`;

const integrationsSendSms = `
  mutation integrationsSendSms($integrationId: String!, $content: String!, $to: String!) {
    integrationsSendSms(integrationId: $integrationId, content: $content, to: $to)
  }
`;

const integrationsVerifyPhoneOrders = `
  mutation integrationsVerifyPhoneOrders {
    integrationsVerifyPhoneOrders
  }
`;

const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

export default {
  integrationsArchive,
  integrationsRepair,
  integrationsUpdateConfigs,
  integrationsCreateExternalIntegration,
  integrationsEditCommonFields,
  integrationsRemove,
  integrationSendMail,
  integrationsSendSms,
  integrationsVerifyPhoneOrders,
  updateConfigs,
};
