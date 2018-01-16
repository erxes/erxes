import {
  Customers,
  ActivityLogs,
  ConversationMessages,
  Conversations,
  EngageMessages,
  InternalNotes,
} from '../../../db/models';

import { moduleRequireLogin } from '../../permissions';

const customerMutations = {
  /**
   * Create new customer also adds Customer registration log
   * @return {Promise} customer object
   */
  async customersAdd(root, doc, { user }) {
    const customer = await Customers.createCustomer(doc);

    await ActivityLogs.createCustomerRegistrationLog(customer, user);

    return customer;
  },

  /**
   * Update customer
   * @return {Promise} customer object
   */
  async customersEdit(root, { _id, ...doc }) {
    return Customers.updateCustomer(_id, doc);
  },

  /**
   * Add new companyId to customer's companyIds list
   * also adds a Company registration activity log
   * @param {Object} args - Graphql input data
   * @param {String} args._id - Customer id
   * @param {String} args.name - Company name
   * @param {String} args.website - Company website
   * @return {Promise} newly created customer
   */
  async customersAddCompany(root, args, { user }) {
    const company = await Customers.addCompany(args);

    await ActivityLogs.createCompanyRegistrationLog(company, user);

    return company;
  },

  /**
   * Update customer Companies
   * @param {string[]} companyIds - Company ids to update
   * @return {Promise} Customer object
   */
  async customersEditCompanies(root, { _id, companyIds }) {
    return Customers.updateCompanies(_id, companyIds);
  },

  /**
   * Merge customers
   * @param {String} customerOneId - First customer to merge
   * @param {String} customerTwoId - Second customer to merge
   * @param {Object} newCustomer - Newly created customer infos
   * @return {Promise} Customer object
   */
  async customersMerge(root, { customerOneId, customerTwoId, newCustomer }) {
    await Customers.removeCustomer(customerOneId);
    await Customers.removeCustomer(customerTwoId);

    const customer = await Customers.createCustomer(newCustomer);
    await ActivityLogs.changeCustomer(customerOneId, newCustomer._id);
    await ActivityLogs.changeCustomer(customerTwoId, newCustomer._id);
    await ConversationMessages.changeCustomer(customerOneId, newCustomer._id);
    await ConversationMessages.changeCustomer(customerTwoId, newCustomer._id);
    await Conversations.changeCustomer(customerOneId, newCustomer._id);
    await Conversations.changeCustomer(customerTwoId, newCustomer._id);
    await EngageMessages.changeCustomer(customerOneId, newCustomer._id);
    await EngageMessages.changeCustomer(customerTwoId, newCustomer._id);
    await InternalNotes.changeCustomer(customerOneId, customerTwoId);
    await InternalNotes.changeCustomer(customerTwoId, customerTwoId);

    return customer;
  },

  /**
   * Remove customers
   * @param {string[]} customerIds - Customer Ids to remove
   * @return {Promise} Customer object
   */
  async customersRemove(root, { customerIds }) {
    for (let customerId of customerIds) {
      await ActivityLogs.removeCustomerActivityLog(customerId);
      await ConversationMessages.removeCustomerConversationMessages(customerId);
      await Conversations.removeCustomerConversations(customerId);
      await EngageMessages.removeCustomerEngages(customerId);
      await InternalNotes.removeCustomerInternalNotes(customerId);
      await Customers.removeCustomer(customerId);
    }

    return customerIds;
  },
};

moduleRequireLogin(customerMutations);

export default customerMutations;
