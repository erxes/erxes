import * as _ from 'underscore';

import {
  IAddress,
  ICustomer,
  ICustomerDocument
} from '../../models/definitions/customers';
import {
  sendCoreMessage,
  sendIntegrationsMessage,
  sendCommonMessage,
  sendInboxMessage
} from '../../messageBroker';
import { COC_LIFECYCLE_STATE_TYPES, MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { validateBulk } from '../../verifierUtils';
import { IContext } from '../../connectionResolver';
import { serviceDiscovery } from '../../configs';

interface ICustomersEdit extends ICustomer {
  _id: string;
}

interface IStateParams {
  _ids: string[];
  value: string;
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
    { models }: IContext
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

    if (doc.customFieldsData) {
      const prevCustomFieldsData = customer.customFieldsData || [];

      for (const data of doc.customFieldsData) {
        const prevEntry = prevCustomFieldsData.find(
          d => d.field === data.field
        );

        if (prevEntry) {
          prevEntry.value = data.value;
        } else {
          prevCustomFieldsData.push(data);
        }
      }

      doc.customFieldsData = prevCustomFieldsData;
    }

    return models.Customers.updateCustomer(customer._id, doc);
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
    const customers: ICustomerDocument[] = await models.Customers.find({
      _id: { $in: customerIds }
    }).lean();

    await models.Customers.removeCustomers(customerIds);

    const commonParams = (ids: string[]) => ({
      subdomain,
      action: 'notification',
      data: { type: 'removeCustomers', customerIds: ids }
    });

    await sendIntegrationsMessage({ ...commonParams(customerIds) });

    for (const customer of customers) {
      await putDeleteLog(
        models,
        subdomain,
        { type: MODULE_NAMES.CUSTOMER, object: customer },
        user
      );
    }

    const services = await serviceDiscovery.getServices();
    let relatedIntegrationIds: string[] = [];
    let mergedIds: string[] = [];

    customers.forEach(c => {
      if (c.relatedIntegrationIds && c.relatedIntegrationIds.length > 0) {
        relatedIntegrationIds = relatedIntegrationIds.concat(
          c.relatedIntegrationIds
        );
      }
      if (c.mergedIds && c.mergedIds.length > 0) {
        mergedIds = mergedIds.concat(c.mergedIds);
      }
    });

    relatedIntegrationIds = _.uniq(relatedIntegrationIds);
    mergedIds = _.uniq(mergedIds);

    const integrations = await sendInboxMessage({
      subdomain,
      action: 'integrations.find',
      isRPC: true,
      data: { query: { _id: { $in: relatedIntegrationIds } } },
      defaultValue: []
    });

    // find related integration of the customer & delete where it's linked
    for (const integration of integrations) {
      const kind = (integration.kind || '').split('-')[0];

      await sendCommonMessage({
        serviceName: services.includes(kind) ? kind : 'integrations',
        ...commonParams([...customerIds, ...mergedIds])
      });
    }

    return customerIds;
  },

  async customersVerify(
    _root,
    { verificationType }: { verificationType: string },
    { models, subdomain }: IContext
  ) {
    await validateBulk(models, subdomain, verificationType);
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
  },

  customersChangeStateBulk(
    _root,
    { _ids, value }: IStateParams,
    { models }: IContext
  ) {
    if (!_ids || _ids.length < 1) {
      throw new Error('Customer ids can not be empty');
    }
    if (!COC_LIFECYCLE_STATE_TYPES.includes(value)) {
      throw new Error('Invalid customer state');
    }

    return models.Customers.updateMany(
      { _id: { $in: _ids } },
      { $set: { state: value } }
    );
  },

  customersEditAddresses(
    _root,
    { _id, addresses }: { _id: string; addresses: IAddress[] },
    { models: { Customers } }: IContext
  ) {
    return Customers.updateAddresses(_id, addresses);
  }
};

checkPermission(customerMutations, 'customersAdd', 'customersAdd');
checkPermission(customerMutations, 'customersEdit', 'customersEdit');
checkPermission(customerMutations, 'customersEditAddresses', 'customersEdit');
checkPermission(customerMutations, 'customersEditByField', 'customersEdit');
checkPermission(customerMutations, 'customersMerge', 'customersMerge');
checkPermission(customerMutations, 'customersRemove', 'customersRemove');
checkPermission(
  customerMutations,
  'customersChangeState',
  'customersChangeState'
);

export default customerMutations;
