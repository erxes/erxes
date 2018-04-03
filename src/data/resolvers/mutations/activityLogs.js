import { ActivityLogs, Customers, Companies, Conversations, Deals } from '../../../db/models';

export default {
  /**
   * Add conversation log
   * @param {Object} root
   * @param {Object} object2 - arguments
   * @param {string} customerId - id of customer
   * @param {string} conversationId - id of conversation
   */
  async activityLogsAddConversationLog(root, { customerId, conversationId }) {
    const customer = await Customers.findOne({ _id: customerId });
    const conversation = await Conversations.findOne({ _id: conversationId });

    return ActivityLogs.createConversationLog(conversation, customer);
  },

  /**
   * Create customer registration log for the given customer
   * @param {Object} root
   * @param {Object} doc - Input data
   * @param {string} doc._id - Customer id
   * @return {Promise} return Promise resolving created ActivityLog document
   */
  async activityLogsAddCustomerLog(root, { _id }) {
    const customer = await Customers.findOne({ _id });
    return ActivityLogs.createCustomerRegistrationLog(customer);
  },

  /**
   * Creates company registration log for the given company
   * @param {Object} root
   * @param {Object} doc - input data
   * @param {string} doc._id - Company id
   * @return {Promise} return Promise resolving created ActivityLog document
   */
  async activityLogsAddCompanyLog(root, { _id }) {
    const company = await Companies.findOne({ _id });
    return ActivityLogs.createCompanyRegistrationLog(company);
  },

  /**
   * Creates deal registration log for the given deal
   * @param {Object} root
   * @param {Object} doc - input data
   * @param {string} doc._id - Deal id
   * @return {Promise} return Promise resolving created ActivityLog document
   */
  async activityLogsAddDealLog(root, { _id }) {
    const deal = await Deals.findOne({ _id });
    return ActivityLogs.createDealRegistrationLog(deal);
  },
};
