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
   * Create new customer also adds Customer registration log
   * @param {Object} root
   * @param {Object} doc - Customer object
   * @param {string} doc.name - Name of customer
   * @param {string} doc.email - Email of customer
   * @param {string} doc.phone - Phone of customer
   * @param {JSON} doc.customFieldsData - customFieldsData of customer JSON
   * @return {Promise} return Promise resolving created ActivityLog document
   */
  async activityLogsAddCustomerLog(root, doc) {
    const customer = await Customers.createCustomer(doc);
    return ActivityLogs.createCustomerRegistrationLog(customer);
  },

  /**
   * Create new company also adds Company registration log
   * @param {Object} root
   * @param {Object} doc - Customer object
   * @param {string} doc.name - Name of company
   * @param {int} doc.size - Size of company
   * @param {string} doc.website - Website of company
   * @param {string} doc.industry - Industry of company
   * @param {string} doc.plan - Plan of company
   * @param {Date} lastSeenAt
   * @param {Int} sessionCount
   * @param {string[]} tagIds - Related tag ids of company
   * @param {JSON} doc.customFieldsData - customFieldsData of customer JSON
   * @return {Promise} return Promise resolving created ActivityLog document
   */
  async activityLogsAddCompanyLog(root, doc) {
    const company = await Companies.createCompany(doc);
    return ActivityLogs.createCompanyRegistrationLog(company);
  },
};
