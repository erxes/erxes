import { Customers, ActivityLogs } from '../../../db/models';

import { moduleRequireLogin } from '../../permissions';

const customerMutations = {
  /**
   * Create new customer also adds Customer registration log
   * @return {Promise} customer object
   */
  async customersAdd(root, doc, { user }) {
    const customer = await Customers.createCustomer(doc, user);

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
   * @param {String[]} companyIds - Company ids to update
   * @return {Promise} Customer object
   */
  async customersEditCompanies(root, { _id, companyIds }) {
    return Customers.updateCompanies(_id, companyIds);
  },

  /**
   * Merge customers
   * @param {String[]} customerIds - Customer ids to merge
   * @param {Object} customerFields - Customer infos to create with
   * @return {Promise} Customer object
   */
  async customersMerge(root, { customerIds, customerFields }) {
    return Customers.mergeCustomers(customerIds, customerFields);
  },

  /**
   * Remove customers
   * @param {String[]} customerIds - Customer Ids to remove
   * @return {Promise} Customer object
   */
  async customersRemove(root, { customerIds }) {
    for (let customerId of customerIds) {
      // Removing every customer and modules associated with
      await Customers.removeCustomer(customerId);
    }

    return customerIds;
  },
};

moduleRequireLogin(customerMutations);

export default customerMutations;
