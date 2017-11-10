import { ActivityLogs, Customers, ConversationMessages } from '../../../db/models';

export default {
  /**
   * Add conversation message log
   * @param {Object} root
   * @param {Object} object2 - arguments
   * @param {string} customerId - id of customer
   * @param {string} conversationId - id of conversation
   * @param {string} messageId - id of message
   */
  async activitivyLogsAddConversationMessageLog(root, { customerId, messageId }) {
    const customer = await Customers.findOne({ _id: customerId });
    const message = await ConversationMessages.findOne({ _id: messageId });

    return ActivityLogs.createConversationMessageLog(message, customer);
  },
};
