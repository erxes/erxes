export const types = `
  type MailMessage {
    _id: String!
    mailData: JSON
    createdAt: Date
  }

  type MailConversationMessages {
    messages: [MailMessage]
    hasMore: Boolean
  }

  type MailConnectionCheck {
    ok: Boolean!
    tenant: String!
    endpoint: String
    error: String
  }

  type MailPipelineIntegration {
    _id: String
    pipelineId: String
    name: String
    address: String
    senderName: String
    healthStatus: String
    error: String
  }

  type MailCloudflareZone {
    id: String
    name: String
    status: String
    accountId: String
    accountName: String
    eligible: Boolean
    reason: String
  }

  type MailProvisionStep {
    name: String
    state: String
    error: String
    ranAt: Date
  }

  type MailSendingCloudflare {
    ready: Boolean
    domain: String
    reason: String
  }

  type MailSendingPlatform {
    ready: Boolean
    domain: String
  }

  type MailSendingReadiness {
    ready: Boolean
    cloudflare: MailSendingCloudflare
    platform: MailSendingPlatform
  }

  type MailCloudflareSendingQuota {
    value: Int
    unit: String
  }

  type MailCloudflareConnection {
    zoneName: String
    accountName: String
    workerOrigin: String
    scriptVersion: String
    currentScriptVersion: String
    sendingEnabled: Boolean
    status: String
    steps: [MailProvisionStep]
    error: String
    connectedAt: Date
  }
`;

export const queries = `
  mailConversationDetail(
    conversationId: String!
    limit: Int
  ): MailConversationMessages

  mailSendingReadiness: MailSendingReadiness

  mailPipelineIntegration(pipelineId: String!): MailPipelineIntegration

  mailCloudflareConnection: MailCloudflareConnection
  mailCloudflareSendingQuota: MailCloudflareSendingQuota
  mailCloudflareZones(token: String!): [MailCloudflareZone]
`;

export const mutations = `
  mailSendMail(
    integrationId: String
    conversationId: String
    subject: String!
    body: String
    to: [String]!
    cc: [String]
    bcc: [String]
    shouldResolve: Boolean
    shouldOpen: Boolean
    replyToMessageId: String
    references: [String]
    attachments: [JSON]
    customerId: String
  ): JSON

  mailPipelineConnect(
    pipelineId: String!
    senderName: String
  ): MailPipelineIntegration

  mailPipelineUpdate(
    pipelineId: String!
    senderName: String
  ): MailPipelineIntegration

  mailPipelineDisconnect(pipelineId: String!): Boolean

  mailMessageRetry(_id: String!): JSON

  mailCheckConnection: MailConnectionCheck

  mailCloudflareConnect(
    token: String!
    zoneId: String!
  ): MailCloudflareConnection
  mailCloudflareProvision: MailCloudflareConnection
  mailCloudflareDisconnect: Boolean
`;
