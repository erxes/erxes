import { Customers, ActivityLogs } from '../../../db/models';

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
};

moduleRequireLogin(customerMutations);

export default customerMutations;
