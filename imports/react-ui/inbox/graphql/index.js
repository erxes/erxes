import conversationList from './conversationList.js';
import userList from './userList.js';
import conversationDetail from './conversationDetail.js';
import subscriptions from './subscriptions.js';
import mutations from './mutations.js';

const queries = {
  conversationList,
  conversationDetail,
  userList,
};

export { queries, subscriptions, mutations };
