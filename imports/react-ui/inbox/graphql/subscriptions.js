import messageFields from './messageFields.js';

export const conversationChanged = `
  subscription conversationChanged($_id: String!) {
    conversationChanged(_id: $_id) {
      type
    }
  }
`;

export const conversationMessageInserted = `
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      ${messageFields}
    }
  }
`;

export const conversationsChanged = `
  subscription conversationsChanged {
    conversationsChanged
  }
`;
