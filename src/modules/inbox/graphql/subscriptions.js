import messageFields from './messageFields.js';

const conversationChanged = `
  subscription conversationChanged($_id: String!) {
    conversationChanged(_id: $_id) {
      type
    }
  }
`;

const conversationMessageInserted = `
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      ${messageFields}
    }
  }
`;

const conversationsChanged = `
  subscription conversationsChanged {
    conversationsChanged
  }
`;

export default {
  conversationChanged,
  conversationMessageInserted,
  conversationsChanged
};
