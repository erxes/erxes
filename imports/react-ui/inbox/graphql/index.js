import conversationList from './conversationList.js';
import conversationDetail from './conversationDetail.js';
import conversationUpdatedSubscription from './conversationUpdatedSubscription.js';
import mutations from './mutations.js';

const queries = {
  conversationList,
  conversationDetail,
};

const subscriptions = {
  conversationUpdated: conversationUpdatedSubscription,
};

export { queries, subscriptions, mutations };
