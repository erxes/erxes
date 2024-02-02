export const types = `
  input WebhookActionInput {
    type: String
    action: String
    label: String
  },

  type WebhookAction {
    type: String
    action: String
    label: String
  },

  type Webhook {
    _id: String!
    url: String!
    token: String
    actions: [WebhookAction]
    status: String
}`;

export const queries = `
  webhooks(page: Int, perPage: Int, searchValue: String): [Webhook]
  webhookDetail(_id: String!): Webhook
  webhooksTotalCount(searchValue: String): Int
  webhooksGetActions: JSON
`;

export const mutations = `
	webhooksAdd(url: String!, actions: [WebhookActionInput]): Webhook
	webhooksEdit(_id: String!,url: String!, actions: [WebhookActionInput]): Webhook
  webhooksRemove(_id: String!): JSON
`;
