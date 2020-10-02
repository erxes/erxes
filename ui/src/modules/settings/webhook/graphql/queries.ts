const webhookResponse = `
      _id
      actions {
        type
        action
        label
      }
      url
      token
      status
`;

const webhookDetail = `
  query webhookDetail($_id: String) {
    webhookDetail(_id: $_id) {
      ${webhookResponse}
    }
  }
`;

const webhooks = `
  query webhooks {
    webhooks {
      ${webhookResponse}
    }
  }
`;

const webhooksTotalCount = `
  query webhooksTotalCount {
    webhooksTotalCount
  }
`;

export default {
  webhooks,
  webhookDetail,
  webhooksTotalCount
};
