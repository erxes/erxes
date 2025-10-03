import { checkPermission } from 'erxes-api-shared/core-modules';
import { ICustomer, ICustomerDocument } from 'erxes-api-shared/core-types';
import { getEnv, getPlugins, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { COC_LIFECYCLE_STATE_TYPES } from '~/modules/contacts/constants';

export const customerMutations = {
  /**
   * Create new customer also adds Customer registration log
   */
  async customersAdd(_parent: undefined, doc: ICustomer, { models }: IContext) {
    const customer = await models.Customers.createCustomer(doc);

    return customer;
  },

  /**
   * Updates a customer
   */
  async customersEdit(
    _parent: undefined,
    { _id, ...doc }: { _id: string } & ICustomer,
    { models }: IContext,
  ) {
    const updated = await models.Customers.updateCustomer(_id, doc);

    return updated;
  },

  /**
   * Remove customers
   */
  async customersRemove(
    _parent: undefined,
    { customerIds }: { customerIds: string[] },
    { models }: IContext,
  ) {
    const customers: ICustomerDocument[] = await models.Customers.find({
      _id: { $in: customerIds },
    }).lean();

    await models.Customers.removeCustomers(customerIds);

    // await sendTRPCMessage({
    //   pluginName: 'frontline',
    //   method: 'mutation',
    //   module: 'integraions',
    //   action: 'notification',
    //   input: { type: 'removeCustomers', customerIds },
    // });

    // const services: string[] = await getPlugins();
    
    let relatedIntegrationIds: string[] = [];
    let mergedIds: string[] = [];

    customers.forEach((c) => {
      if (c.relatedIntegrationIds && c.relatedIntegrationIds.length > 0) {
        relatedIntegrationIds = relatedIntegrationIds.concat(
          c.relatedIntegrationIds,
        );
      }
      if (c.mergedIds && c.mergedIds.length > 0) {
        mergedIds = mergedIds.concat(c.mergedIds);
      }
    });

    relatedIntegrationIds = [...new Set(relatedIntegrationIds)];
    mergedIds = [...new Set(mergedIds)];

    // const integrations = await sendTRPCMessage({
    //   pluginName: 'frontline',
    //   method: 'mutation',
    //   module: 'integrations',
    //   action: 'find',
    //   input: { query: { _id: { $in: relatedIntegrationIds } } },
    //   defaultValue: [],
    // });

    // // find related integration of the customer & delete where it's linked
    // for (const integration of integrations) {
    //   const kind: string = (integration.kind || '').split('-')[0];

    //   await sendTRPCMessage({
    //     pluginName: 'frontline',
    //     method: 'mutation',
    //     module: services.includes(kind) ? kind : 'integrations',
    //     action: 'notification',
    //     input: {
    //       type: 'removeCustomers',
    //       customerIds: [...customerIds, ...mergedIds],
    //     },
    //   });
    // }

    return customerIds;
  },

  /**
   * Change state
   */
  async customersChangeState(
    _parent: undefined,
    args: { _id: string; value: string },
    { models }: IContext,
  ) {
    return models.Customers.changeState(args._id, args.value);
  },

  /**
   * Merge customers
   */
  async customersMerge(
    _parent: undefined,
    {
      customerIds,
      customerFields,
    }: { customerIds: string[]; customerFields: ICustomer },
    { user, models }: IContext,
  ) {
    return models.Customers.mergeCustomers(customerIds, customerFields, user);
  },

  async customersVerify(
    _parent: undefined,
    { verificationType }: { verificationType: string },
    { models, subdomain }: IContext,
  ) {
    const EMAIL_VERIFIER_ENDPOINT = getEnv({
      name: 'EMAIL_VERIFIER_ENDPOINT',
      defaultValue: 'http://localhost:4100',
    });

    const DOMAIN = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:4000';
    const domain = DOMAIN.replace('<subdomain>', subdomain);

    const callback_url = `${domain}/pl:core`;

    const BATCH_SIZE = 1000;

    const sendBatch = async (data: string[], type: 'email' | 'phone') => {
      // Filter out empty strings from the data array
      const filteredData = data.filter((item) => item.trim() !== '');

      if (filteredData.length === 0) {
        return; // No valid data to send, skip this batch
      }
      const endpoint = `${EMAIL_VERIFIER_ENDPOINT}/verify-bulk`;
      const body =
        type === 'email'
          ? { emails: filteredData, hostname: callback_url }
          : { phones: filteredData, hostname: callback_url };

      try {
        await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error(
          'Verification fetch failed:',
          error instanceof Error ? error.message : 'Unknown error',
        );
        throw error;
      }
    };

    const processBatch = async (customersCursor, type: 'email' | 'phone') => {
      const batch: string[] = [];

      for await (const customer of customersCursor) {
        if (type === 'email') {
          batch.push(customer.primaryEmail);
        } else {
          batch.push(customer.primaryPhone);
        }

        if (batch.length >= BATCH_SIZE) {
          await sendBatch(batch, type);
          batch.length = 0; // Clear the batch
        }
      }

      if (batch.length > 0) {
        await sendBatch(batch, type);
      }
    };

    if (verificationType === 'email') {
      const customersCursor = models.Customers.find(
        {
          primaryEmail: { $exists: true, $nin: [null, ''] },
          $or: [
            { emailValidationStatus: 'unknown' },
            { emailValidationStatus: { $exists: false } },
          ],
        },
      ).select('primaryEmail -_id').cursor();

      await processBatch(customersCursor, 'email');
    } else {
      const customersCursor = models.Customers.find(
        {
          primaryPhone: { $exists: true, $nin: [null, ''] },
          $or: [
            { phoneValidationStatus: 'unknown' },
            { phoneValidationStatus: { $exists: false } },
          ],
        }
      ).select('primaryPhone -_id').cursor();

      await processBatch(customersCursor, 'phone');
    }

    return 'done';
  },

  async customersChangeVerificationStatus(
    _parent: undefined,
    args: { customerIds: string[]; type: string; status: string },
    { models }: IContext,
  ) {
    return models.Customers.updateVerificationStatus(
      args.customerIds,
      args.type,
      args.status,
    );
  },

  async customersChangeStateBulk(
    _parent: undefined,
    {
      _ids,
      value,
    }: {
      _ids: string[];
      value: string;
    },
    { models }: IContext,
  ) {
    if (!_ids || _ids.length < 1) {
      throw new Error('Customer ids can not be empty');
    }
    if (!COC_LIFECYCLE_STATE_TYPES.includes(value)) {
      throw new Error('Invalid customer state');
    }

    return models.Customers.updateMany(
      { _id: { $in: _ids } },
      { $set: { state: value } },
    );
  },
};

checkPermission(customerMutations, 'customersAdd', 'customersAdd');
checkPermission(customerMutations, 'customersEdit', 'customersEdit');
checkPermission(customerMutations, 'customersEditByField', 'customersEdit');
checkPermission(customerMutations, 'customersMerge', 'customersMerge');
checkPermission(customerMutations, 'customersRemove', 'customersRemove');
checkPermission(
  customerMutations,
  'customersChangeState',
  'customersChangeState',
);
