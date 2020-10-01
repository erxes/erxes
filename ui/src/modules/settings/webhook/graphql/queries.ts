const webhookResponse = `
_id
isOutgoing
actions {
  type
  action
  label
}
url
`;

const webhookDetail = `
  query webhookDetail($_id: String) {
    webhookDetail(_id: $_id) {
      ${webhookResponse}
    }
  }
`;


const webhooks = `
  query webhooks($isOutgoing: Boolean) {
    webhooks(isOutgoing: $isOutgoing) {
      ${webhookResponse}
    }
  }
`;


const webhooksTotalCount = `
  query webhooksTotalCount($isOutgoing: Boolean) {
    webhooksTotalCount(isOutgoing: $isOutgoing)
  }
`;


export default {
  webhooks,
  webhookDetail,
  webhooksTotalCount
};
