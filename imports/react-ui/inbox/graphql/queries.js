import conversationFields from './conversationFields';
import messageFields from './messageFields';

export const conversationList = `query objects($params: ConversationListParams) {
  conversations(params: $params) {
    ${conversationFields}
  }
}`;

export const conversationDetail = `query conversationDetail($_id: String!) {
  conversationDetail(_id: $_id) {
    ${conversationFields}

    messages {
      ${messageFields}
    }
  }
}`;

export const userList = `query objects {
  users {
    _id
    username
    details
  }
}`;
