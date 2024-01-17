import fetch from 'node-fetch';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { CUSTOMER_STATUSES } from '../common/constants';
import {
  customerDetail as customerDetailQuery,
  customersAdd as customersAddQueries,
} from '../common/customerQueries';
import { IModels } from '../connectionResolver';
import { sendContactsMessage } from '../messageBroker';
import { ISyncDocument, syncSaasSchema } from './definitions/sync';
import { validateDoc } from './utils';

export interface ISyncModel extends Model<ISyncDocument> {
  addSync(doc: any, user: any): Promise<ISyncDocument>;
  editSync(_id: string, doc: any): Promise<ISyncDocument>;
  removeSync(_id: string): Promise<ISyncDocument>;
  getSyncedSaas({ subdomain, customerId }, mainSubDomain): Promise<any>;
  getCustomerDoc(customer: any): Promise<any>;
}

export const loadSyncClass = (models: IModels, subdomain: string) => {
  class Sync {
    public static async addSync(doc: any, user: IUserDocument) {
      try {
        validateDoc(doc);
      } catch (error) {
        throw new Error(error.message);
      }

      const { SAAS_CORE_URL } = process.env;

      await fetch(`${SAAS_CORE_URL}/check-subdomain`, {
        headers: {
          origin: `${doc.subdomain}..app.erxes.io`,
        },
      });

      const extendedDoc = {
        ...doc,
        createdUserId: user._id,
      };

      return await models.Sync.create({ ...extendedDoc });
    }

    public static async editSync(_id, doc) {
      const { SAAS_CORE_URL } = process.env;

      try {
        validateDoc(doc);
      } catch (error) {
        throw new Error(error.message);
      }

      const sync = await models.Sync.findOne({ _id });

      if (!sync) {
        throw new Error('Cannot find sync');
      }

      if (sync.subdomain !== doc.subdomain) {
        await fetch(`${SAAS_CORE_URL}/check-subdomain`, {
          headers: {
            origin: `${doc.subdomain}..app.erxes.io`,
          },
        });
      }
      return await models.Sync.updateOne({ _id }, { $set: doc });
    }

    public static async removeSync(_id) {
      const sync = await models.Sync.findOne({ _id });

      if (!sync) {
        throw new Error('Cannot find sync');
      }

      await models.SyncedCustomers.deleteMany({ syncId: _id });

      return await models.Sync.findByIdAndDelete(_id);
    }

    public static async getSyncedSaas(
      { subdomain, customerId },
      mainSubDomain,
    ) {
      const sync = await models.Sync.findOne({ subdomain }).lean();

      if (!sync) {
        throw new Error('Cannot find sync');
      }

      if (sync.expireDate <= new Date().toString()) {
        throw new Error('This sync expired');
      }

      const isCustomerExistsSaas = await this.checkSaasCustomer(
        sync.subdomain,
        sync.appToken,
        customerId,
      );
      const syncedCustomer = await models.SyncedCustomers.findOne({
        syncId: sync?._id,
        customerId,
      });

      if (
        isCustomerExistsSaas &&
        syncedCustomer?.status === CUSTOMER_STATUSES.APPROVED
      ) {
        sync.customerId = customerId;

        return sync;
      }

      if (
        isCustomerExistsSaas &&
        syncedCustomer?.status === CUSTOMER_STATUSES.WAITING
      ) {
        throw new Error('Customer not approved in synced saas');
      }

      const customer = await sendContactsMessage({
        subdomain: mainSubDomain,
        action: 'customers.findOne',
        data: { _id: customerId },
        isRPC: true,
        defaultValue: null,
      });

      if (!customer) {
        throw new Error('Cannot find customer');
      }

      const newCustomer = await this.createCustomerToSaas(sync, customer);

      if (!newCustomer) {
        throw new Error('Somthing went wrong');
      }

      await models.SyncedCustomers.create({
        syncId: sync._id,
        customerId: customer._id,
        syncedCustomerId: newCustomer._id,
        status: !!sync?.checkApproved ? CUSTOMER_STATUSES.WAITING : undefined,
      });

      if (!!sync?.checkApproved) {
        return {
          subdomain,
          customerId: customer._id,
        };
      }

      const updatedSync = await models.Sync.findOne({ _id: sync._id }).lean();

      updatedSync.customerId = customer._id;
      return updatedSync;
    }

    public static async getCustomerDoc(customer) {
      let customerDoc = {};

      for (const key of Object.keys(customer)) {
        if (
          [
            'state',
            'sex',
            'emails',
            'emailValidationStatus',
            'phones',
            'phoneValidationStatus',
            'status',
            'hasAuthority',
            'doNotDisturb',
            'isSubscribed',
            'relatedIntegrationIds',
            'links',
            'deviceTokens',
            'firstName',
            'lastName',
            'middleName',
            'primaryEmail',
          ].includes(key)
        ) {
          customerDoc[key] = customer[key];
        }
      }

      return customerDoc;
    }

    public static async createCustomerToSaas(sync, customer) {
      const { data, errors } = await fetch(
        `https://${sync.subdomain}.app.erxes.io/gateway/graphql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'erxes-app-token': sync.appToken,
          },
          body: JSON.stringify({
            query: customersAddQueries,
            variables: { ...(await this.getCustomerDoc(customer)) },
          }),
        },
      ).then((res) => res.json());

      if (errors) {
        throw new Error(errors[0]?.message);
      }

      const newCustomer = data?.customersAdd ? data?.customersAdd : null;

      return newCustomer;
    }

    public static async checkSaasCustomer(subdomain, appToken, customerId) {
      const sync = await models.Sync.findOne({ subdomain });

      const syncedCustomer = await models.SyncedCustomers.findOne({
        syncId: sync?._id,
        customerId,
      });

      if (!syncedCustomer) {
        return false;
      }

      const { data, errors } = await fetch(
        `https://${subdomain}.app.erxes.io/gateway/graphql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'erxes-app-token': appToken,
          },
          body: JSON.stringify({
            query: customerDetailQuery,
            variables: { _id: syncedCustomer?.syncedCustomerId },
          }),
        },
      ).then((res) => res.json());

      if (errors) {
        throw new Error(errors[0]?.message);
      }

      const { customerDetail } = data;

      return !!customerDetail;
    }
  }

  syncSaasSchema.loadClass(Sync);

  return syncSaasSchema;
};
