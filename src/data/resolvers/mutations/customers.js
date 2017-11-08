import { Customers, ActivityLogs } from '../../../db/models';

import { moduleRequireLogin } from '../../permissions';

const customerMutations = {
  /**
   * Create new customer
   * @return {Promise} customer object
   */
  customersAdd(root, doc) {
    return Customers.createCustomer(doc);
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
   * @param {Object} args - Graphql input data
   * @param {String} args._id - Customer id
   * @param {String} args.name - Company name
   * @param {String} args.website - Company website
   * @return {Promise} newly created customer
   */
  async customersAddCompany(root, args) {
    const customer = Customers.addCompany(args);
    await ActivityLogs.createCustomerLog(customer);
    return customer;
  },
};

moduleRequireLogin(customerMutations);

export default customerMutations;
