import { ActivityLogs, Customers, Companies, ConversationMessages } from '../../../db/models';

export default {
  /**
   * Add conversation message log
   * @param {Object} root
   * @param {Object} object2 - arguments
   * @param {string} customerId - id of customer
   * @param {string} messageId - id of message
   */
  async activityLogsAddConversationMessageLog(root, { customerId, messageId }) {
    const customer = await Customers.findOne({ _id: customerId });
    const message = await ConversationMessages.findOne({ _id: messageId });

    return ActivityLogs.createConversationMessageLog(message, customer);
  },

  /**
   * Create customer registration log for the given customer
   * @param {Object} root
   * @param {Object} doc - Input data
   * @param {string} doc._id - Customer id
   * @return {Promise} return Promise resolving created ActivityLog document
   */
  async activityLogsAddCustomerLog(root, doc) {
    const customer = await Customers.findOne(doc);
    return ActivityLogs.createCustomerRegistrationLog(customer);
  },

  /**
   * Creates company registration log for the given company
   * @param {Object} root
   * @param {Object} doc - input data
   * @param {string} doc._id - Company id
   * @return {Promise} return Promise resolving created ActivityLog document
   */
  async activityLogsAddCompanyLog(root, doc) {
    const company = await Companies.findOne(doc);
    return ActivityLogs.createCompanyRegistrationLog(company);
  },
};
