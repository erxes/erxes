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
  async customersEdit(_root, { _id, ...doc }: ICustomersEdit, { user }: IContext) {
    const customer = await Customers.findOne({ _id });
    const updated = await Customers.updateCustomer(_id, doc);

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
   * Merge customers
   */
  async customersMerge(_root, { customerIds, customerFields }: { customerIds: string[]; customerFields: ICustomer }) {
    return Customers.mergeCustomers(customerIds, customerFields);
  },

  /**
   * Remove customers
   */
  async customersRemove(_root, { customerIds }: { customerIds: string[] }, { user }: IContext) {
    const customers = await Customers.find({ _id: { $in: customerIds } }, { firstName: 1 }).lean();

    await Customers.removeCustomers(customerIds);

    for (const customer of customers) {
      if (customer) {
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
checkPermission(customerMutations, 'customersMerge', 'customersMerge');
checkPermission(customerMutations, 'customersRemove', 'customersRemove');

export default customerMutations;
