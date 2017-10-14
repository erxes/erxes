import { Customers } from '../../../db/models';

export default {
  /**
   * Create new customer
   * @return {Promise} customer object
   */
  customersAdd(root, doc, { user }) {
    if (!user) throw new Error('Login required');

    return Customers.createCustomer(doc);
  },

  /**
   * Update customer
   * @return {Promise} customer object
   */
  async customersEdit(root, { _id, ...doc }, { user }) {
    if (!user) throw new Error('Login required');

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
  async customersAddCompany(root, args, { user }) {
    if (!user) throw new Error('Login required');

    return Customers.addCompany(args);
  },
};
