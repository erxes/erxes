import { call } from '../erxes';

const Customer = {
  readMessages(conversationId) {
    return () => call('customerReadMessages', conversationId);
  },
};

export default Customer;
