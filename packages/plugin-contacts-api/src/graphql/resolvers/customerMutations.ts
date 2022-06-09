import { ICustomer } from '../../models/definitions/customers';
import { sendCoreMessage, sendIntegrationsMessage } from '../../messageBroker';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { validateBulk } from '../../verifierUtils';
import { IContext } from '../../connectionResolver';

interface ICustomersEdit extends ICustomer {
  _id: string;
}

const customerMutations = {
  /**
   * Create new customer also adds Customer registration log
   */
  async customersAdd(
    _root,
    doc: ICustomer,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const modifiedDoc = docModifier(doc);

    const customer = await models.Customers.createCustomer(modifiedDoc, user);

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.CUSTOMER,
        newData: modifiedDoc,
        object: customer
      },
      user
    );

    sendCoreMessage({
      subdomain,
      action: 'registerOnboardHistory',
      data: {
        type: `${customer.state}Create`,
        user
      }
    });

    return customer;
  },

  /**
   * Updates a customer
   */
  async customersEdit(
    _root,
    { _id, ...doc }: ICustomersEdit,
    { user, models, subdomain }: IContext
  ) {
    const customer = await models.Customers.getCustomer(_id);
    const updated = await models.Customers.updateCustomer(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.CUSTOMER,
        object: customer,
        newData: doc,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Finding customer to update by searching primaryEmail,primarPhone etc ...
   */
  async customersEditByField(
    _root,
    {
      selector,
      doc
    }: {
      selector: { primaryEmail?: string; primaryPhone?: string; code?: string };
      doc: ICustomersEdit;
    },
    { user, models }: IContext
  ) {
    let customer;

    if (selector.primaryEmail) {
      customer = await models.Customers.findOne({
        primaryEmail: selector.primaryEmail
      }).lean();
    }

    if (!customer && selector.primaryPhone) {
      customer = await models.Customers.findOne({
        primarPhone: selector.primaryPhone
      }).lean();
    }

    if (!customer && selector.code) {
      customer = await models.Customers.findOne({ code: selector.code }).lean();
    }

    if (!customer) {
      throw new Error('Customer not found');
    }

    const updated = await models.Customers.updateCustomer(customer._id, doc);

    return updated;
  },

  /**
   * Change state
   */
  async customersChangeState(
    _root,
    args: { _id: string; value: string },
    { models: { Customers } }: IContext
  ) {
    return Customers.changeState(args._id, args.value);
  },

  /**
   * Merge customers
   */
  async customersMerge(
    _root,
    {
      customerIds,
      customerFields
    }: { customerIds: string[]; customerFields: ICustomer },
    { user, models: { Customers } }: IContext
  ) {
    return Customers.mergeCustomers(customerIds, customerFields, user);
  },

  /**
   * Remove customers
   */
  async customersRemove(
    _root,
    { customerIds }: { customerIds: string[] },
    { user, models, subdomain }: IContext
  ) {
    const customers = await models.Customers.find({
      _id: { $in: customerIds }
    }).lean();

    await models.Customers.removeCustomers(customerIds);

    await sendIntegrationsMessage({
      subdomain,
      action: 'notification',
      data: {
        type: 'removeCustomers',
        customerIds
      }
    });

    for (const customer of customers) {
      await putDeleteLog(
        models,
        subdomain,
        { type: MODULE_NAMES.CUSTOMER, object: customer },
        user
      );

      if (customer.mergedIds) {
        await sendIntegrationsMessage({
          subdomain,
          action: 'notification',
          data: {
            type: 'removeCustomers',
            customerIds: customer.mergedIds
          }
        });
      }
    }

    return customerIds;
  },

  async customersVerify(
    _root,
    { verificationType }: { verificationType: string },
    { models }: IContext
  ) {
    await validateBulk(models, verificationType);
  },

  async customersChangeVerificationStatus(
    _root,
    args: { customerIds: [string]; type: string; status: string },
    { models: { Customers } }: IContext
  ) {
    return Customers.updateVerificationStatus(
      args.customerIds,
      args.type,
      args.status
    );
  }
};

checkPermission(customerMutations, 'customersAdd', 'customersAdd');
checkPermission(customerMutations, 'customersEdit', 'customersEdit');
checkPermission(customerMutations, 'customersEditByField', 'customersEdit');
checkPermission(customerMutations, 'customersMerge', 'customersMerge');
checkPermission(customerMutations, 'customersRemove', 'customersRemove');
checkPermission(
  customerMutations,
  'customersChangeState',
  'customersChangeState'
);

export default customerMutations;
