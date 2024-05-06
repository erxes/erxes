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
  query webhooks($page: Int, $perPage: Int, $searchValue: String) {
    webhooks(page: $page, perPage: $perPage, searchValue: $searchValue) {
      ${webhookResponse}
    }
  }
`;

const webhooksTotalCount = `
  query webhooksTotalCount($searchValue: String) {
    webhooksTotalCount(searchValue: $searchValue)
  }
`;

const webhooksGetActions = `
  query webhooksGetActions {
    webhooksGetActions
  }
`;

export default {
  webhooks,
  webhookDetail,
  webhooksTotalCount,
  webhooksGetActions,
};
