import { ActivityLogs, Customers } from '../../../db/models';
import { ICustomer } from '../../../db/models/definitions/customers';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface ICustomersEdit extends ICustomer {
  _id: string;
}

const customerMutations = {
  /**
   * Create new customer also adds Customer registration log
   */
  async customersAdd(_root, doc: ICustomer, { user, docModifier }: IContext) {
    const modifiedDoc = docModifier(doc);
    const customer = await Customers.createCustomer(modifiedDoc, user);

    await putCreateLog(
      {
        type: MODULE_NAMES.CUSTOMER,
        newData: modifiedDoc,
        object: customer,
      },
      user,
    );

    return customer;
  },

  /**
   * Updates a customer
   */
  async customersEdit(_root, { _id, ...doc }: ICustomersEdit, { user }: IContext) {
    const customer = await Customers.getCustomer(_id);
    const updated = await Customers.updateCustomer(_id, doc);

    await putUpdateLog(
      {
        type: MODULE_NAMES.CUSTOMER,
        object: customer,
        newData: doc,
        updatedDocument: updated,
      },
      user,
    );

    return updated;
  },

  /**
   * Merge customers
   */
  async customersMerge(
    _root,
    { customerIds, customerFields }: { customerIds: string[]; customerFields: ICustomer },
    { user }: IContext,
  ) {
    return Customers.mergeCustomers(customerIds, customerFields, user);
  },

  /**
   * Remove customers
   */
  async customersRemove(_root, { customerIds }: { customerIds: string[] }, { user }: IContext) {
    const customers = await Customers.find({ _id: { $in: customerIds } }).lean();

    await Customers.removeCustomers(customerIds);

    for (const customer of customers) {
      await ActivityLogs.removeActivityLog(customer._id);

      await putDeleteLog({ type: MODULE_NAMES.CUSTOMER, object: customer }, user);
    }

    return customerIds;
  },
};

checkPermission(customerMutations, 'customersAdd', 'customersAdd');
checkPermission(customerMutations, 'customersEdit', 'customersEdit');
checkPermission(customerMutations, 'customersMerge', 'customersMerge');
checkPermission(customerMutations, 'customersRemove', 'customersRemove');

export default customerMutations;
