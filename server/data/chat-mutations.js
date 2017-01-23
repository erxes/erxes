import {
  getIntegration,
  createConversationWithMessage,
  getOrCreateCustomer,
} from './utils';

export default {
  /*
   * Find integrationId by brandCode
   */
  chatConnect(root, args) {
    return getIntegration(args.brandCode, 'chat')
      .then(integ => integ._id)

      // catch exception
      .catch((error) => {
        console.log(error); // eslint-disable-line no-console
      });
  },

  /*
   * Create new conversation and message
   */
  chatCreateConversation(root, args) {
    const { integrationId, email, content } = args;

    // get or create customer
    return getOrCreateCustomer({ integrationId, email })

      // create chat conversation
      .then(customerId =>
        createConversationWithMessage({
          integrationId,
          customerId,
          content,
        }),
      )

      // catch exception
      .catch((error) => {
        console.log(error); // eslint-disable-line no-console
      });
  },
};
