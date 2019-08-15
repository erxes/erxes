import { Customers } from '../../../db/models';
import { ICustomer } from '../../../db/models/definitions/customers';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';

interface ICustomersEdit extends ICustomer {
  _id: string;
}

const customerMutations = {
  /**
   * Create new customer also adds Customer registration log
   */
  async customersAdd(_root, doc: ICustomer, { user, docModifier }: IContext) {
    const customer = await Customers.createCustomer(docModifier(doc), user);

    await putCreateLog(
      {
        type: 'customer',
        newData: JSON.stringify(doc),
        object: customer,
        description: `${customer.firstName} has been created`,
      },
      user,
    );

    return customer;
  },

  /**
   * Update customer
   */
  async customersEdit(_root, { _id, ...doc }: ICustomersEdit, { user, docModifier }: IContext) {
    const customer = await Customers.findOne({ _id });
    const updated = await Customers.updateCustomer(_id, docModifier(doc));

    if (customer) {
      await putUpdateLog(
        {
          type: 'customer',
          object: customer,
          newData: JSON.stringify(doc),
          description: `${customer.firstName} has been updated`,
        },
        user,
      );
    }

    return updated;
  },

  /**
   * Update customer Companies
   */
  async customersEditCompanies(_root, { _id, companyIds }: { _id: string; companyIds: string[] }) {
    return Customers.updateCompanies(_id, companyIds);
  },

  /**
   * Merge customers
   */
  async customersMerge(_root, { customerIds, customerFields }: { customerIds: string[]; customerFields: ICustomer }) {
    return Customers.mergeCustomers(customerIds, customerFields);
  },

  /**
   * Remove customers
   */
  async customersRemove(_root, { customerIds }: { customerIds: string[] }, { user }: IContext) {
    for (const customerId of customerIds) {
      // Removing every customer and modules associated with
      const customer = await Customers.findOne({ _id: customerId });
      const removed = await Customers.removeCustomer(customerId);

      if (customer && removed) {
        await putDeleteLog(
          {
            type: 'customer',
            object: customer,
            description: `${customer.firstName} has been deleted`,
          },
          user,
        );
      }
    }

    return customerIds;
  },
};

checkPermission(customerMutations, 'customersAdd', 'customersAdd');
checkPermission(customerMutations, 'customersEdit', 'customersEdit');
checkPermission(customerMutations, 'customersEditCompanies', 'customersEditCompanies');
checkPermission(customerMutations, 'customersMerge', 'customersMerge');
checkPermission(customerMutations, 'customersRemove', 'customersRemove');

export default customerMutations;
