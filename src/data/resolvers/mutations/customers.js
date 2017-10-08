import { Customers } from '../../../db/models';

export default {
  /**
   * Update customer
   * @return {Promise} customer object
   */
  async customersEdit(root, { _id, ...doc }, { user }) {
    if (!user) throw new Error('Login required');

    return Customers.updateCustomer(_id, doc);
  },
};
